import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFParse } from "pdf-parse";
import dotenv from "dotenv";
dotenv.config({});

let geminiInstance = null;

export const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set. Please configure GEMINI_API_KEY in your backend environment variables.");
    }
    if (!geminiInstance) {
        geminiInstance = new GoogleGenerativeAI(apiKey);
    }
    return geminiInstance;
};

/**
 * Extract clean text from a PDF buffer in memory.
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
export const extractTextFromPDF = async (buffer) => {
    if (!buffer || buffer.length === 0) {
        throw new Error("Uploaded PDF file is empty.");
    }
    let parser = null;
    try {
        parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        const rawText = result?.text || "";
        const cleanText = rawText.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();

        if (!cleanText || cleanText.length < 20) {
            throw new Error("Could not extract readable text from this PDF. Please ensure it is a text-based PDF rather than a scanned image.");
        }
        return cleanText;
    } catch (err) {
        if (err.message && err.message.includes("Could not extract readable text")) {
            throw err;
        }
        throw new Error(`Failed to parse PDF document: ${err.message}`);
    } finally {
        if (parser && typeof parser.destroy === "function") {
            try {
                await parser.destroy();
            } catch (_) {
                // ignore parser destroy errors
            }
        }
    }
};

/**
 * Use Google Gemini 1.5 Flash with structured JSON output to analyze resume text.
 * Completely dynamic: works for ANY profession or skill set under the free tier.
 * @param {string} resumeText 
 * @returns {Promise<Object>}
 */
export const analyzeResumeWithAI = async (resumeText) => {
    const genAI = getGeminiClient();

    const systemPrompt = `You are an expert AI resume analyzer and career specialist.
Analyze the provided resume text thoroughly and extract structured professional information.
Extract ONLY factual information present in the resume text. DO NOT fabricate or hallucinate skills, companies, or projects.

You must respond ONLY with a valid JSON object matching this exact structure:
{
  "skills": ["string"],
  "technicalSkills": ["string"],
  "programmingLanguages": ["string"],
  "frameworks": ["string"],
  "tools": ["string"],
  "education": ["string"],
  "experience": [
    {
      "role": "string",
      "company": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "technologies": ["string"]
    }
  ],
  "yearsOfExperience": 0,
  "targetRoles": ["string"],
  "certifications": ["string"],
  "summary": "string"
}

Notes:
- "skills" should be a consolidated list of all identified skills (technical, functional, analytical, domain-specific).
- "yearsOfExperience" must be a number representing total estimated years of professional experience (use 0 for fresher/student).
- "targetRoles" should be suitable job titles inferred from the candidate's experience, projects, and skills.
- "summary" should be a concise 2-sentence summary of the candidate's profile.`;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
        }
    });

    const prompt = `${systemPrompt}\n\nHere is the resume text to analyze:\n\n${resumeText.slice(0, 25000)}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
        throw new Error("Received empty response from Gemini model during resume analysis.");
    }

    try {
        const parsed = JSON.parse(content);
        return {
            skills: Array.isArray(parsed.skills) ? parsed.skills : [],
            technicalSkills: Array.isArray(parsed.technicalSkills) ? parsed.technicalSkills : [],
            programmingLanguages: Array.isArray(parsed.programmingLanguages) ? parsed.programmingLanguages : [],
            frameworks: Array.isArray(parsed.frameworks) ? parsed.frameworks : [],
            tools: Array.isArray(parsed.tools) ? parsed.tools : [],
            education: Array.isArray(parsed.education) ? parsed.education : [],
            experience: Array.isArray(parsed.experience) ? parsed.experience : [],
            projects: Array.isArray(parsed.projects) ? parsed.projects : [],
            yearsOfExperience: typeof parsed.yearsOfExperience === "number" ? parsed.yearsOfExperience : 0,
            targetRoles: Array.isArray(parsed.targetRoles) ? parsed.targetRoles : [],
            certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
            summary: typeof parsed.summary === "string" ? parsed.summary : ""
        };
    } catch (parseError) {
        throw new Error(`Failed to parse AI resume analysis JSON: ${parseError.message}`);
    }
};

/**
 * Generate a 768-dimensional vector embedding for a given text using Google Gemini text-embedding-004.
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
export const generateEmbedding = async (text) => {
    if (!text || text.trim().length === 0) {
        throw new Error("Cannot generate embedding for empty text.");
    }
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const cleanText = text.replace(/\s+/g, " ").trim().slice(0, 8000);

    const result = await model.embedContent(cleanText);
    const embedding = result.embedding?.values;
    if (!embedding || !Array.isArray(embedding)) {
        throw new Error("Failed to generate vector embedding from Gemini gemini-embedding-001.");
    }
    return embedding;
};

/**
 * Generate a normalized text representation for a Job for embedding creation.
 * Dynamically includes all available job attributes.
 * @param {Object} job 
 * @returns {string}
 */
export const formatJobForEmbedding = (job) => {
    const companyName = job.company?.name || "";
    const skills = Array.isArray(job.requirements)
        ? job.requirements.join(", ")
        : (job.requirements || "");

    return `Job Title: ${job.title || ""}
Company: ${companyName}
Location: ${job.location || ""}
Employment Type: ${job.jobType || ""}
Experience Required: ${job.experiencelevel ?? 0} years
Required Skills: ${skills}
Description: ${job.description || ""}`;
};

/**
 * Generate a rich, clean text representation of a resume for embedding creation.
 * @param {Object} analysis 
 * @param {string} rawText 
 * @returns {string}
 */
export const formatResumeForEmbedding = (analysis, rawText) => {
    const skills = Array.isArray(analysis?.skills) ? analysis.skills.join(", ") : "";
    const targetRoles = Array.isArray(analysis?.targetRoles) ? analysis.targetRoles.join(", ") : "";
    const education = Array.isArray(analysis?.education) ? analysis.education.join(", ") : "";
    const expSummary = Array.isArray(analysis?.experience)
        ? analysis.experience.map(e => `${e.role || ""} at ${e.company || ""}`).join("; ")
        : "";

    return `Target Roles: ${targetRoles}
Years of Experience: ${analysis?.yearsOfExperience ?? 0}
Key Skills: ${skills}
Experience Summary: ${expSummary}
Education: ${education}
Profile Summary: ${analysis?.summary || ""}
Resume Content: ${rawText.slice(0, 3000)}`;
};

/**
 * Computes vector cosine similarity between two float arrays.
 * Works identically for any dimension (e.g. 768 or 1536).
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} Value between -1.0 and 1.0 (typically 0.0 to 1.0)
 */
export const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
        return 0;
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Calculates a production-quality hybrid match score and explanation between a Job and a User's Resume.
 * Weights:
 * - Semantic Cosine Similarity: 60%
 * - Skills Match: 25%
 * - Experience Alignment: 15%
 * 
 * Completely dynamic: works for ANY job in the database and ANY resume.
 * 
 * @param {Object} job 
 * @param {Object} resumeAnalysis 
 * @param {number[]} resumeEmbedding 
 * @param {number[]} jobEmbedding 
 * @returns {Object}
 */
export const calculateHybridMatch = (job, resumeAnalysis, resumeEmbedding, jobEmbedding) => {
    // 1. Semantic Similarity (60% weight)
    const rawCosSim = (jobEmbedding && jobEmbedding.length > 0 && resumeEmbedding && resumeEmbedding.length > 0)
        ? cosineSimilarity(resumeEmbedding, jobEmbedding)
        : 0;
    // Scale cosine similarity cleanly to 0 - 100%
    const semanticNormalized = rawCosSim > 0
        ? Math.max(0, Math.min(100, ((rawCosSim - 0.20) / 0.65) * 100))
        : 50; // fallback neutral score if embedding temporarily absent

    // 2. Skills Match (25% weight)
    // Gather all extracted resume skills in lower-case for robust matching
    const resumeSkillsList = [
        ...(resumeAnalysis?.skills || []),
        ...(resumeAnalysis?.technicalSkills || []),
        ...(resumeAnalysis?.frameworks || []),
        ...(resumeAnalysis?.tools || []),
        ...(resumeAnalysis?.programmingLanguages || [])
    ].map(s => String(s).trim().toLowerCase()).filter(Boolean);

    const uniqueResumeSkills = Array.from(new Set(resumeSkillsList));

    const jobRequirements = (Array.isArray(job.requirements) ? job.requirements : [])
        .map(r => String(r).trim())
        .filter(Boolean);

    const matchedSkills = [];
    const missingSkills = [];

    const isSkillMatch = (reqSkill, userSkill) => {
        if (userSkill === reqSkill) return true;
        if (reqSkill.length > 2 && userSkill.includes(reqSkill)) return true;
        if (userSkill.length > 2 && reqSkill.includes(userSkill)) return true;
        // Clean special characters e.g. "node.js" vs "node"
        const cleanReq = reqSkill.replace(/[\.\-_]/g, "");
        const cleanUser = userSkill.replace(/[\.\-_]/g, "");
        return cleanReq === cleanUser;
    };

    jobRequirements.forEach(req => {
        const reqLower = req.toLowerCase();
        const found = uniqueResumeSkills.some(skill => isSkillMatch(reqLower, skill));
        if (found) {
            matchedSkills.push(req);
        } else {
            missingSkills.push(req);
        }
    });

    const skillScore = jobRequirements.length > 0
        ? Math.round((matchedSkills.length / jobRequirements.length) * 100)
        : 75; // Default neutral score if no specific requirements listed

    // 3. Experience Match (15% weight)
    const candidateExp = Number(resumeAnalysis?.yearsOfExperience) || 0;
    const requiredExp = Number(job.experiencelevel) || 0;
    let expScore = 100;
    if (candidateExp < requiredExp) {
        const diff = requiredExp - candidateExp;
        expScore = Math.max(25, Math.round((1 - (diff / Math.max(requiredExp, 3))) * 100));
    }

    // 4. Hybrid Combined Score
    const weightedScore = Math.round(
        (0.60 * semanticNormalized) +
        (0.25 * skillScore) +
        (0.15 * expScore)
    );
    // Clamp score cleanly between realistic bounds
    const matchPercentage = Math.max(20, Math.min(98, weightedScore));

    // 5. Dynamic Explanation of Why this Matches
    const reasons = [];
    if (matchedSkills.length > 0) {
        const preview = matchedSkills.slice(0, 3).join(", ");
        reasons.push(`Strong overlap with required skills (${preview}${matchedSkills.length > 3 ? `, +${matchedSkills.length - 3} more` : ""}).`);
    } else {
        reasons.push("Related background and transferable skills identified.");
    }

    if (candidateExp >= requiredExp) {
        reasons.push(`Experience level (${candidateExp} yr${candidateExp === 1 ? "" : "s"}) aligns well with the required ${requiredExp} yr${requiredExp === 1 ? "" : "s"}.`);
    } else {
        reasons.push(`Close match on core responsibilities, though role prefers ${requiredExp} yrs experience.`);
    }

    // Check target roles / title alignment
    const targetRoles = Array.isArray(resumeAnalysis?.targetRoles) ? resumeAnalysis.targetRoles : [];
    const jobTitleLower = (job.title || "").toLowerCase();
    const roleAligned = targetRoles.some(role => jobTitleLower.includes(role.toLowerCase()) || role.toLowerCase().includes(jobTitleLower));
    if (roleAligned) {
        reasons.push("Direct alignment with candidate's target career roles.");
    }

    const matchExplanation = reasons.join(" ");

    return {
        matchPercentage,
        matchedSkills,
        missingSkills,
        matchExplanation,
        rawCosSim: Number(rawCosSim.toFixed(4)),
        scores: {
            semantic: Math.round(semanticNormalized),
            skills: skillScore,
            experience: expScore
        }
    };
};
