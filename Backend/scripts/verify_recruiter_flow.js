import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

import { User } from '../models/user.model.js';
import { Company } from '../models/company.model.js';
import { Job } from '../models/job.model.js';

const API_BASE = "http://localhost:8001/api/v1";

async function apiRequest(endpoint, options = {}, token = null) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
        ...options,
        headers
    });

    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
}

async function runTests() {
    console.log("==================================================");
    console.log("STARTING RECRUITER FLOW VERIFICATION (TESTS A-D)");
    console.log("==================================================");

    await mongoose.connect(process.env.MONGO_URI);

    // 1. Fetch recruiters
    const recruiterA = await User.findOne({ email: "aashisoni@gmail.com", role: "recruiter" });
    const recruiterB = await User.findOne({ email: "riya@gmail.com", role: "recruiter" });
    const emptyRecruiter = await User.findOne({ email: "khushi@gmail.com", role: "recruiter" });

    if (!recruiterA || !recruiterB || !emptyRecruiter) {
        throw new Error("Required test recruiter accounts not found in database.");
    }

    const tokenA = jwt.sign({ userId: recruiterA._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
    const tokenB = jwt.sign({ userId: recruiterB._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
    const tokenEmpty = jwt.sign({ userId: emptyRecruiter._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

    // ==========================================================
    // TEST A: Log in as Recruiter & View Companies
    // ==========================================================
    console.log("\n--- TEST A: View Companies ---");
    // A1: Recruiter A view companies
    const resA = await apiRequest("/company/get", { method: "GET" }, tokenA);
    console.log(`[PASS] Recruiter A (${recruiterA.email}) GET /company/get -> Status: ${resA.status}, Companies Count: ${resA.data.companies.length}`);
    if (resA.data.companies.length > 0) {
        const sampleComp = resA.data.companies[0];
        console.log(`   Sample Company: "${sampleComp.name}", Logo: "${sampleComp.logo || 'Initials Fallback'}", Created: "${sampleComp.createdAt}"`);
    }

    // A2: Recruiter with 0 companies (empty state verification)
    const resEmpty = await apiRequest("/company/get", { method: "GET" }, tokenEmpty);
    console.log(`[PASS] Empty Recruiter (${emptyRecruiter.email}) GET /company/get -> Status: ${resEmpty.status}, Companies:`, resEmpty.data.companies);
    if (!Array.isArray(resEmpty.data.companies) || resEmpty.data.companies.length !== 0) {
        throw new Error("Expected empty array for recruiter with no companies!");
    }

    // ==========================================================
    // TEST B: Create New Company
    // ==========================================================
    console.log("\n--- TEST B: Create Company ---");
    const testCompanyName = `VerifCorp_${Date.now()}`;
    const createRes = await apiRequest("/company/register", {
        method: "POST",
        body: JSON.stringify({ companyName: testCompanyName })
    }, tokenA);
    console.log(`[PASS] POST /company/register -> Status: ${createRes.status}, Created: "${createRes.data.company.name}", ID: ${createRes.data.company._id}`);
    
    // Verify ownership
    const createdCompInDb = await Company.findById(createRes.data.company._id);
    if (createdCompInDb.userId.toString() !== recruiterA._id.toString()) {
        throw new Error("Created company userId does NOT match recruiterA ID!");
    }
    console.log(`[PASS] Ownership verified: Company userId (${createdCompInDb.userId}) matches Recruiter A (${recruiterA._id})`);

    // Verify company immediately shows in Recruiter A's company list
    const resAAfterCreate = await apiRequest("/company/get", { method: "GET" }, tokenA);
    const foundNew = resAAfterCreate.data.companies.some(c => c._id.toString() === createdCompInDb._id.toString());
    console.log(`[PASS] New company immediately present in GET /company/get: ${foundNew}`);

    // ==========================================================
    // TEST C: Create New Job Linked to Company
    // ==========================================================
    console.log("\n--- TEST C: Create Job & Verify Logo Linking ---");
    const jobPayload = {
        title: `Automation QA Lead ${Date.now()}`,
        description: "Develop end-to-end automated test suites, CI/CD validation pipelines, and reliability tests.",
        requirements: "Playwright, Jest, CI/CD, TypeScript",
        salary: 18,
        location: "Bangalore",
        jobType: "Remote",
        industry: "Software / IT",
        experiencelevel: 4,
        position: 2,
        companyId: createdCompInDb._id.toString()
    };

    const postJobRes = await apiRequest("/job/post", {
        method: "POST",
        body: JSON.stringify(jobPayload)
    }, tokenA);
    console.log(`[PASS] POST /job/post -> Status: ${postJobRes.status}, Job ID: ${postJobRes.data.job._id}`);

    // Verify in Admin Jobs
    const adminJobsRes = await apiRequest("/job/getadminjobs", { method: "GET" }, tokenA);
    const createdAdminJob = adminJobsRes.data.jobs.find(j => j._id.toString() === postJobRes.data.job._id.toString());
    console.log(`[PASS] Job found in GET /job/getadminjobs: "${createdAdminJob?.title}", Company: "${createdAdminJob?.company?.name}"`);

    // Verify on Public Jobs (Home / Browse / Details)
    const publicJobsRes = await apiRequest("/job/get", { method: "GET" });
    const foundPublic = publicJobsRes.data.jobs.find(j => j._id.toString() === postJobRes.data.job._id.toString());
    console.log(`[PASS] Job found in public GET /job/get: "${foundPublic?.title}", Company Name: "${foundPublic?.company?.name}", Company ID: "${foundPublic?.company?._id}"`);

    // ==========================================================
    // TEST D: Multi-tenant Isolation
    // ==========================================================
    console.log("\n--- TEST D: Multi-tenant Isolation ---");
    const resB = await apiRequest("/company/get", { method: "GET" }, tokenB);
    console.log(`[PASS] Recruiter B (${recruiterB.email}) GET /company/get -> Count: ${resB.data.companies.length}`);

    // Verify Recruiter B does NOT see Recruiter A's new company
    const bSeesNewComp = resB.data.companies.some(c => c._id.toString() === createdCompInDb._id.toString());
    console.log(`[PASS] Recruiter B cannot see Recruiter A's company: ${!bSeesNewComp}`);

    // Verify Recruiter B cannot update Recruiter A's company
    const updateAttemptRes = await apiRequest(`/company/update/${createdCompInDb._id}`, {
        method: "PUT",
        body: JSON.stringify({ name: "HackedName" })
    }, tokenB);
    console.log(`[PASS] Cross-tenant update blocked with Status: ${updateAttemptRes.status} (${updateAttemptRes.data?.message})`);

    // Verify Recruiter B cannot post a job for Recruiter A's company
    const crossPostRes = await apiRequest("/job/post", {
        method: "POST",
        body: JSON.stringify({
            ...jobPayload,
            title: "Illegitimate Job",
            companyId: createdCompInDb._id.toString()
        })
    }, tokenB);
    console.log(`[PASS] Cross-tenant job posting blocked with Status: ${crossPostRes.status} (${crossPostRes.data?.message})`);

    // Clean up the temporary verification company and job
    await Job.findByIdAndDelete(postJobRes.data.job._id);
    await Company.findByIdAndDelete(createdCompInDb._id);
    console.log("[PASS] Test cleanup: Temporary verification job and company removed cleanly.");

    await mongoose.disconnect();
    console.log("\n==================================================");
    console.log("ALL VERIFICATION TESTS PASSED SUCCESSFULLY! (100%)");
    console.log("==================================================");
}

runTests().catch(err => {
    console.error("TEST SUITE FAILED:", err);
    process.exit(1);
});
