import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../models/user.model.js';
import { Company } from '../models/company.model.js';
import { Job } from '../models/job.model.js';

/**
 * Idempotent Recruiter Company Sync
 * Ensures recruiter accounts have their associated companies correctly linked.
 */
async function syncRecruiterCompanies() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB successfully.");

        // Find primary recruiter
        const primaryUser = await User.findOne({ email: "aashisoni@gmail.com", role: "recruiter" });
        const oldUser = await User.findOne({ email: "aashisoni123@gmail.com", role: "recruiter" });

        if (primaryUser && oldUser) {
            const currentCompanies = await Company.countDocuments({ userId: primaryUser._id });
            console.log(`Current companies for ${primaryUser.email}: ${currentCompanies}`);

            if (currentCompanies === 0) {
                console.log(`Associating companies and jobs from ${oldUser.email} to ${primaryUser.email}...`);
                const compResult = await Company.updateMany({ userId: oldUser._id }, { userId: primaryUser._id });
                const jobResult = await Job.updateMany({ created_by: oldUser._id }, { created_by: primaryUser._id });
                console.log(`Companies transferred: ${compResult.modifiedCount}, Jobs transferred: ${jobResult.modifiedCount}`);
            } else {
                console.log("Companies already associated. No migration needed.");
            }
        }

        // Summary of all recruiters
        const recruiters = await User.find({ role: "recruiter" }, "fullname email _id");
        console.log("\n=== RECRUITER OWNERSHIP BREAKDOWN ===");
        for (const r of recruiters) {
            const compCount = await Company.countDocuments({ userId: r._id });
            const jobCount = await Job.countDocuments({ created_by: r._id });
            console.log(`Recruiter: ${r.fullname} (${r.email}) -> ${compCount} companies, ${jobCount} jobs`);
        }

        await mongoose.disconnect();
        console.log("Disconnected cleanly.");
    } catch (err) {
        console.error("Sync error:", err);
        process.exit(1);
    }
}

syncRecruiterCompanies();
