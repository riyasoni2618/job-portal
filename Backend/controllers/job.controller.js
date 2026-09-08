import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import { formatJobForEmbedding, generateEmbedding, calculateHybridMatch } from "../utils/ai.js";

//admin post krega job 
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experiencelevel, position, companyId, industry } = req.body;
        const userId = req.id;
        if (!title || !description || !requirements || !salary || !location || !jobType || !experiencelevel || !position || !companyId) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }
        if (company.userId.toString() !== userId) {
            return res.status(403).json({
                message: "You can only post jobs for your own registered companies.",
                success: false
            });
        }
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(",").map(r => r.trim()).filter(Boolean),
            salary: Number(salary),
            location,
            jobType,
            industry: industry ? String(industry).trim() : undefined,
            experiencelevel: Number(experiencelevel),
            position: Number(position),
            company: companyId,
            created_by: userId
        });

        // Generate and store embedding for the newly created job
        try {
            await job.populate({ path: "company" });
            const embeddingText = formatJobForEmbedding(job);
            const embedding = await generateEmbedding(embeddingText);
            job.embedding = embedding;
            job.embeddingUpdatedAt = new Date();
            await job.save();
        } catch (embedError) {
            console.error("Embedding generation warning during postJob:", embedError.message);
            // We allow job creation even if Gemini API is temporarily unavailable
        }

        return res.status(201).json({
            message: "New job created Successfully",
            job,
            success: true,
        });
    } catch (error) {
        console.log("Post Job Error:", error);
        return res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false
        });
    }
} 
//for student
export const getAllJobs = async (req,res) => {
    try {
        const { keyword, location, industry, salary } = req.query;
        const andConditions = [];

        // Location aliases dictionary
        const locationMap = {
            "delhi ncr": ["delhi", "new delhi", "ncr", "delhi ncr"],
            "delhi": ["delhi", "new delhi", "ncr", "delhi ncr"],
            "noida": ["noida"],
            "gurgaon": ["gurgaon", "gurugram"],
            "gurugram": ["gurgaon", "gurugram"],
            "gurugram / gurgaon": ["gurgaon", "gurugram"],
            "bangalore": ["bangalore", "bengaluru"],
            "bengaluru": ["bangalore", "bengaluru"],
            "bangalore / bengaluru": ["bangalore", "bengaluru"],
            "hyderabad": ["hyderabad"],
            "pune": ["pune"],
            "mumbai": ["mumbai", "bombay"],
            "chennai": ["chennai", "madras"],
            "kolkata": ["kolkata", "calcutta"],
            "jaipur": ["jaipur"]
        };

        const buildLocationRegex = (locInput) => {
            const clean = String(locInput).toLowerCase().trim();
            const patterns = locationMap[clean] || [clean];
            return patterns.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|");
        };

        // 1. Explicit Location filter
        if (location && String(location).trim() !== "") {
            const locRegex = buildLocationRegex(location);
            andConditions.push({ location: { $regex: locRegex, $options: "i" } });
        }

        // 2. Explicit Industry filter
        if (industry && String(industry).trim() !== "") {
            const cleanInd = String(industry).trim();
            andConditions.push({
                $or: [
                    { industry: { $regex: cleanInd, $options: "i" } },
                    { title: { $regex: cleanInd, $options: "i" } },
                    { description: { $regex: cleanInd, $options: "i" } }
                ]
            });
        }

        // 3. Explicit Salary range filter
        if (salary && String(salary).trim() !== "") {
            const salStr = String(salary).replace(/[–—]/g, '-').trim();
            if (salStr.includes("+")) {
                const min = parseFloat(salStr.replace(/[^0-9.]/g, ''));
                if (!isNaN(min)) {
                    andConditions.push({ salary: { $gte: min } });
                }
            } else if (salStr.includes("-")) {
                const parts = salStr.split("-").map(p => parseFloat(p.replace(/[^0-9.]/g, '')));
                const min = parts[0];
                const max = parts[1];
                if (!isNaN(min) && !isNaN(max)) {
                    andConditions.push({ salary: { $gte: min, $lte: max } });
                } else if (!isNaN(min)) {
                    andConditions.push({ salary: { $gte: min } });
                }
            }
        }

        // 4. Keyword / Search Bar filter
        if (keyword && String(keyword).trim() !== "") {
            const rawKeyword = String(keyword).trim();
            if (rawKeyword.startsWith("location:")) {
                const locPart = rawKeyword.replace("location:", "").trim();
                const locRegex = buildLocationRegex(locPart);
                andConditions.push({ location: { $regex: locRegex, $options: "i" } });
            } else {
                const locRegex = buildLocationRegex(rawKeyword);
                andConditions.push({
                    $or: [
                        { title: { $regex: rawKeyword, $options: "i" } },
                        { description: { $regex: rawKeyword, $options: "i" } },
                        { industry: { $regex: rawKeyword, $options: "i" } },
                        { location: { $regex: locRegex, $options: "i" } }
                    ]
                });
            }
        }

        const query = andConditions.length > 0 ? { $and: andConditions } : {};

        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            jobs: jobs || [],
            success: true
        });
    } catch (error) {
        console.log("Get All Jobs Error:", error);
        return res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false
        });
    }
}
//for student
export const getJobById = async(req,res)=>{
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId)
            .populate({
                path: "application",
                populate: {
                    path: "applicant"
                }
            })
            .populate({
                path: "company"
            });
        if(!job){
             return res.status(404).json({
                message:" job not found.",
                success:false
            })
        };
        return res.status(200).json({
            job,
            success:true
        });
    }catch(error){
        console.log("Get Job By ID Error:", error);
        return res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false
        });
    }
}
//how many  job admin create
export const getAdminJobs = async(req,res)=>{
    try {
        const adminId = req.id;
        if (!adminId) {
            return res.status(401).json({
                message: "User not authenticated.",
                success: false
            });
        }
        const jobs = await Job.find({ created_by: adminId })
            .populate({ path: "company" })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            jobs: jobs || [],
            success: true
        });
    }catch(error){
        console.log("Get Admin Jobs Error:", error);
        return res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false
        });
    }
}
//update job
export const updateJob = async(req,res)=>{
    try {
        const jobId = req.params.id;
        const userId = req.id;
        const {title,description,requirements, salary, location,jobType,experiencelevel,position,companyId} = req.body;
        
        // Check if job exists and belongs to the user
        const job = await Job.findById(jobId);
        if(!job){
            return res.status(404).json({
                message:"Job not found.",
                success:false
            });
        }
        if(job.created_by.toString() !== userId){
            return res.status(403).json({
                message:"You are not authorized to update this job.",
                success:false
            });
        }

        // Update job fields
        if (title) job.title = title;
        if (description) job.description = description;
        if (requirements) job.requirements = requirements.split(",").map(r => r.trim()).filter(Boolean);
        if (salary) job.salary = Number(salary);
        if (location) job.location = location;
        if (jobType) job.jobType = jobType;
        if (experiencelevel) job.experiencelevel = Number(experiencelevel);
        if (position) job.position = Number(position);
        if (companyId) job.company = companyId;

        // Re-generate and update embedding if relevant fields changed
        try {
            await job.populate({ path: "company" });
            const embeddingText = formatJobForEmbedding(job);
            const embedding = await generateEmbedding(embeddingText);
            job.embedding = embedding;
            job.embeddingUpdatedAt = new Date();
        } catch (embedError) {
            console.error("Embedding generation warning during updateJob:", embedError.message);
        }

        await job.save();
        
        return res.status(200).json({
            message: "Job updated successfully",
            job,
            success: true
        });
    } catch (error) {
        console.log("Update Job Error:", error);
        return res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false
        });
    }
};

// AI-powered Resume -> Job Recommendations
export const getRecommendations = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("+profile.resumeEmbedding");

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        const resumeEmbedding = user.profile?.resumeEmbedding;
        const resumeAnalysis = user.profile?.resumeAnalysis;

        if (!resumeEmbedding || resumeEmbedding.length === 0 || !resumeAnalysis) {
            return res.status(200).json({
                message: "Upload your resume to discover jobs that match your skills.",
                hasResume: false,
                recommendations: [],
                success: true
            });
        }

        // Fetch all active jobs with populated company and their embeddings
        const jobs = await Job.find({}).populate({
            path: "company"
        }).select("+embedding");

        if (!jobs || jobs.length === 0) {
            return res.status(200).json({
                message: "No jobs currently available for recommendations.",
                hasResume: true,
                recommendations: [],
                success: true
            });
        }

        const recommendations = [];

        for (const job of jobs) {
            let jobEmbedding = job.embedding;

            // On-demand embedding generation for existing jobs without embeddings
            if (!jobEmbedding || jobEmbedding.length === 0) {
                try {
                    const embedText = formatJobForEmbedding(job);
                    jobEmbedding = await generateEmbedding(embedText);
                    job.embedding = jobEmbedding;
                    job.embeddingUpdatedAt = new Date();
                    await job.save();
                } catch (genErr) {
                    console.error(`Could not generate embedding for job ${job._id}:`, genErr.message);
                }
            }

            if (jobEmbedding && jobEmbedding.length > 0) {
                const match = calculateHybridMatch(job, resumeAnalysis, resumeEmbedding, jobEmbedding);
                recommendations.push({
                    job: {
                        _id: job._id,
                        title: job.title,
                        description: job.description,
                        requirements: job.requirements,
                        salary: job.salary,
                        experiencelevel: job.experiencelevel,
                        location: job.location,
                        jobType: job.jobType,
                        position: job.position,
                        company: job.company,
                        createdAt: job.createdAt
                    },
                    matchPercentage: match.matchPercentage,
                    matchedSkills: match.matchedSkills,
                    missingSkills: match.missingSkills,
                    matchExplanation: match.matchExplanation,
                    scores: match.scores
                });
            }
        }

        // Rank from highest match score to lowest
        recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

        // Top N results (default 10)
        const limit = parseInt(req.query.limit) || 10;
        const topRecommendations = recommendations.slice(0, limit);

        return res.status(200).json({
            success: true,
            hasResume: true,
            resumeOriginalName: user.profile?.resumeOriginalName || "Resume.pdf",
            resumeAnalysis: {
                skills: resumeAnalysis?.skills || [],
                targetRoles: resumeAnalysis?.targetRoles || [],
                yearsOfExperience: resumeAnalysis?.yearsOfExperience ?? 0,
                summary: resumeAnalysis?.summary || ""
            },
            recommendations: topRecommendations
        });
    } catch (error) {
        console.error("Get Recommendations Error:", error);
        return res.status(500).json({
            message: error.message || "Failed to generate recommendations. Please try again later.",
            success: false
        });
    }
};

