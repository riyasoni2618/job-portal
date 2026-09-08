import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary, { getAccessibleResumeUrl } from "../utils/cloudinary.js";
import { extractTextFromPDF, analyzeResumeWithAI, generateEmbedding, formatResumeForEmbedding } from "../utils/ai.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
        console.log("📥 Incoming Data:", req.body);
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        
        const file = req.file;
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: cloudResponse.secure_url,
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        console.log("📥 Incoming Data:", req.body);

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '30d' });

        const sanitizedProfile = user.profile ? {
            ...(user.profile.toObject ? user.profile.toObject() : user.profile),
            resume: getAccessibleResumeUrl(user.profile.resume)
        } : user.profile;

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: sanitizedProfile
        }

        const cookieOptions = {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "none"
        };
        
        
        console.log("🍪 Setting cookie with options:", cookieOptions);
        return res.status(200).cookie("token", token, cookieOptions).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log("Login Error:", error);
        return res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false
        });
    }
}
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;

        const file = req.file;
        const userId = req.id; // middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }

        // updating data
        if (fullname) user.fullname = fullname
        if (email) user.email = email
        if (phoneNumber) user.phoneNumber = phoneNumber
        if (bio) user.profile.bio = bio
        
        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",").map(skill => skill.trim()).filter(skill => skill.length > 0);
            user.profile.skills = skillsArray;
        }

        // Handle file upload only if file is provided
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                resource_type: "auto",
                folder: "resumes"
            });
            if (cloudResponse) {
                user.profile.resume = cloudResponse.secure_url; // save the cloudinary url
                user.profile.resumeOriginalName = file.originalname; // Save the original file name
            }
        }

        await user.save();

        const sanitizedProfile = user.profile ? {
            ...(user.profile.toObject ? user.profile.toObject() : user.profile),
            resume: getAccessibleResumeUrl(user.profile.resume)
        } : user.profile;

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: sanitizedProfile
        }

        return res.status(200).json({
            message: "Profile updated successfully.",
            user,
            success: true
        })
    } catch (error) {
        console.log("Update Profile Error:", error);
        return res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false
        });
    }
};

// Upload and Analyze PDF Resume
export const uploadAndAnalyzeResume = async (req, res) => {
    try {
        const userId = req.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: "Please upload a resume file (PDF).",
                success: false
            });
        }

        // Validate file type
        const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            return res.status(400).json({
                message: "Only PDF resumes are supported. Please upload a valid .pdf file.",
                success: false
            });
        }

        // Validate file size (max 5MB)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return res.status(400).json({
                message: "File size exceeds the 5MB limit. Please upload a smaller PDF.",
                success: false
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        // 1. Extract text from PDF buffer
        let resumeText = "";
        try {
            resumeText = await extractTextFromPDF(file.buffer);
        } catch (pdfErr) {
            return res.status(400).json({
                message: pdfErr.message || "Failed to extract text from PDF. Please check if the file is valid and not password-protected.",
                success: false
            });
        }

        // 2. Upload file to Cloudinary for permanent hosting and viewing
        let resumeUrl = user.profile?.resume || "";
        try {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                resource_type: "auto",
                folder: "resumes"
            });
            if (cloudResponse?.secure_url) {
                resumeUrl = cloudResponse.secure_url;
            }
        } catch (cloudErr) {
            console.error("Cloudinary upload notice:", cloudErr.message);
            // If Cloudinary fails or is not configured, we still continue with AI processing
        }

        // 3. AI Analysis using Google Gemini structured JSON output
        let analysis = null;
        try {
            analysis = await analyzeResumeWithAI(resumeText);
        } catch (aiErr) {
            console.error("AI Analysis Error:", aiErr);
            return res.status(500).json({
                message: aiErr.message || "AI resume analysis failed. Please try again.",
                success: false
            });
        }

        // 4. Generate vector embedding for semantic matching
        let resumeEmbedding = [];
        try {
            const embeddingText = formatResumeForEmbedding(analysis, resumeText);
            resumeEmbedding = await generateEmbedding(embeddingText);
        } catch (embedErr) {
            console.error("Embedding generation error:", embedErr);
            return res.status(500).json({
                message: embedErr.message || "Failed to generate AI embedding for resume.",
                success: false
            });
        }

        // 5. Update user profile in database
        if (!user.profile) {
            user.profile = {};
        }

        user.profile.resume = resumeUrl || user.profile.resume;
        user.profile.resumeOriginalName = file.originalname;
        user.profile.resumeText = resumeText;
        user.profile.resumeAnalysis = analysis;
        user.profile.resumeEmbedding = resumeEmbedding;
        user.profile.resumeAnalysisUpdatedAt = new Date();

        // If user profile doesn't have skills or has fewer skills, populate from AI analysis
        if (Array.isArray(analysis.skills) && analysis.skills.length > 0) {
            const existingSkills = Array.isArray(user.profile.skills) ? user.profile.skills : [];
            const mergedSkills = Array.from(new Set([...existingSkills, ...analysis.skills]));
            user.profile.skills = mergedSkills;
        }

        await user.save();

        const sanitizedUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: {
                bio: user.profile.bio,
                skills: user.profile.skills,
                resume: getAccessibleResumeUrl(user.profile.resume),
                resumeOriginalName: user.profile.resumeOriginalName,
                profilePhoto: user.profile.profilePhoto,
                resumeAnalysisUpdatedAt: user.profile.resumeAnalysisUpdatedAt
            }
        };

        return res.status(200).json({
            message: "Resume uploaded and analyzed successfully!",
            user: sanitizedUser,
            analysis,
            success: true
        });
    } catch (error) {
        console.error("Upload and Analyze Resume Error:", error);
        return res.status(500).json({
            message: error.message || "Internal server error during resume processing.",
            success: false
        });
    }
};

// Get current user's resume analysis
export const getResumeAnalysis = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        const analysis = user.profile?.resumeAnalysis || null;
        const hasResume = !!(user.profile?.resume || user.profile?.resumeText);

        return res.status(200).json({
            success: true,
            hasResume,
            resumeOriginalName: user.profile?.resumeOriginalName || null,
            resumeUrl: user.profile?.resume || null,
            resumeAnalysisUpdatedAt: user.profile?.resumeAnalysisUpdatedAt || null,
            analysis
        });
    } catch (error) {
        console.error("Get Resume Analysis Error:", error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};