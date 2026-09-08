import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from './models/user.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';

// 10 Major Locations
const LOCATIONS = [
    "Delhi", "Noida", "Gurugram", "Bangalore", "Hyderabad",
    "Pune", "Mumbai", "Chennai", "Kolkata", "Jaipur"
];

// 10 Major Industries
const INDUSTRIES = [
    "Software / IT", "FinTech", "E-commerce", "EdTech", "HealthTech",
    "AI / Machine Learning", "Banking", "Consulting", "SaaS", "Telecom"
];

const COMPANIES_SEED = [
    { name: "Google", location: "Bangalore", website: "https://google.com", description: "Global technology leader in search, cloud, AI, and operating systems." },
    { name: "Microsoft", location: "Hyderabad", website: "https://microsoft.com", description: "Pioneer in personal computing, enterprise cloud, and developer platforms." },
    { name: "Razorpay", location: "Bangalore", website: "https://razorpay.com", description: "Leading Indian payment gateway and financial technology services provider." },
    { name: "Paytm", location: "Noida", website: "https://paytm.com", description: "India's pioneer in digital payments, financial services, and mobile commerce." },
    { name: "Swiggy", location: "Bangalore", website: "https://swiggy.com", description: "Leading on-demand convenience and online food delivery platform." },
    { name: "Flipkart", location: "Bangalore", website: "https://flipkart.com", description: "Top Indian e-commerce marketplace offering millions of products nationwide." },
    { name: "Unacademy", location: "Bangalore", website: "https://unacademy.com", description: "Interactive online learning and test preparation educational technology platform." },
    { name: "Practo", location: "Bangalore", website: "https://practo.com", description: "Pioneering healthcare platform connecting patients with verified medical experts." },
    { name: "Innovaccer", location: "Noida", website: "https://innovaccer.com", description: "Leading healthcare data activation platform accelerating digital transformation." },
    { name: "OpenAI Labs", location: "Bangalore", website: "https://openai.com", description: "Research organization developing safe and beneficial artificial general intelligence." },
    { name: "HDFC Bank", location: "Mumbai", website: "https://hdfcbank.com", description: "Premier Indian private sector banking and comprehensive financial services." },
    { name: "ICICI Bank", location: "Mumbai", website: "https://icicibank.com", description: "Multinational banking and financial services institution with global presence." },
    { name: "Deloitte", location: "Hyderabad", website: "https://deloitte.com", description: "Global leader in audit, consulting, advisory, and financial tax services." },
    { name: "McKinsey", location: "Gurugram", website: "https://mckinsey.com", description: "Global management consulting firm advising top enterprises and governments." },
    { name: "Freshworks", location: "Chennai", website: "https://freshworks.com", description: "Innovative customer engagement software and SaaS solutions for modern businesses." },
    { name: "Postman", location: "Bangalore", website: "https://postman.com", description: "Industry-standard collaborative platform for API design, testing, and lifecycle management." },
    { name: "Airtel", location: "Gurugram", website: "https://airtel.in", description: "Global telecommunications services company operating across Asia and Africa." },
    { name: "Jio Platforms", location: "Mumbai", website: "https://jio.com", description: "Digital services and telecommunications giant transforming connectivity in India." },
    { name: "TCS", location: "Mumbai", website: "https://tcs.com", description: "Global leader in IT consulting and business solutions enterprise engineering." },
    { name: "Infosys", location: "Bangalore", website: "https://infosys.com", description: "Digital transformation and IT consulting enterprise serving clients globally." }
];

// 40 Curated Diverse Job Postings (4 per location, 4 per industry, covering all 7 salary tiers)
const JOBS_SEED = [
    // --- 1. Software / IT (4 jobs) ---
    {
        title: "Senior Full Stack Engineer",
        companyName: "Google",
        location: "Bangalore",
        industry: "Software / IT",
        salary: 28, // 25+ LPA
        experiencelevel: 5,
        jobType: "Hybrid",
        position: 4,
        requirements: ["React", "Node.js", "TypeScript", "System Design", "Cloud Infrastructure"],
        description: "Architect and build large-scale cloud-native web applications. Design distributed microservices and intuitive, accessible user interfaces using React and Node.js."
    },
    {
        title: "Java Backend Developer",
        companyName: "TCS",
        location: "Kolkata",
        industry: "Software / IT",
        salary: 7.5, // 5-8 LPA
        experiencelevel: 2,
        jobType: "Onsite",
        position: 6,
        requirements: ["Java", "Spring Boot", "REST APIs", "Microservices", "PostgreSQL"],
        description: "Develop reliable enterprise backend services and REST APIs with Spring Boot. Optimize SQL query performance and integrate with message brokers."
    },
    {
        title: "Junior Frontend Developer",
        companyName: "Infosys",
        location: "Jaipur",
        industry: "Software / IT",
        salary: 4.5, // 3-5 LPA
        experiencelevel: 1,
        jobType: "Onsite",
        position: 5,
        requirements: ["HTML5", "CSS3", "JavaScript", "React", "Git"],
        description: "Build clean, accessible web components and collaborate with UI/UX designers to translate Figma mockups into production-ready responsive React pages."
    },
    {
        title: "DevOps & Cloud Engineer",
        companyName: "Microsoft",
        location: "Hyderabad",
        industry: "Software / IT",
        salary: 16, // 12-18 LPA
        experiencelevel: 4,
        jobType: "Hybrid",
        position: 3,
        requirements: ["Kubernetes", "Docker", "Terraform", "CI/CD", "Azure", "Linux"],
        description: "Automate containerized deployment pipelines, monitor cluster uptime, and manage cloud infrastructure as code across multi-region environments."
    },

    // --- 2. FinTech (4 jobs) ---
    {
        title: "Payment Gateway Backend Engineer",
        companyName: "Razorpay",
        location: "Bangalore",
        industry: "FinTech",
        salary: 22, // 18-25 LPA
        experiencelevel: 4,
        jobType: "Remote",
        position: 3,
        requirements: ["Go", "Node.js", "Kafka", "Distributed Systems", "PostgreSQL", "Redis"],
        description: "Build high-throughput, fault-tolerant transaction processing pipelines. Ensure zero-downtime payments and robust cryptographic transaction verification."
    },
    {
        title: "FinTech Fraud Prevention Analyst",
        companyName: "Paytm",
        location: "Noida",
        industry: "FinTech",
        salary: 6.5, // 5-8 LPA
        experiencelevel: 2,
        jobType: "Onsite",
        position: 4,
        requirements: ["SQL", "Python", "Risk Assessment", "Fraud Detection", "Data Analytics"],
        description: "Analyze financial transaction logs to identify anomalous behavior and coordinate with risk management teams to prevent payment fraud."
    },
    {
        title: "Mobile App Developer (FinTech)",
        companyName: "Razorpay",
        location: "Pune",
        industry: "FinTech",
        salary: 14, // 12-18 LPA
        experiencelevel: 3,
        jobType: "Hybrid",
        position: 2,
        requirements: ["React Native", "Flutter", "TypeScript", "Mobile Security", "Biometric Auth"],
        description: "Build slick, secure mobile financial applications supporting seamless checkout, UPI transactions, and multi-factor biometric authentication."
    },
    {
        title: "Compliance & Risk Operations Specialist",
        companyName: "Paytm",
        location: "Jaipur",
        industry: "FinTech",
        salary: 3.5, // 3-5 LPA
        experiencelevel: 1,
        jobType: "Onsite",
        position: 3,
        requirements: ["KYC", "AML", "Regulatory Compliance", "Risk Audit", "Documentation"],
        description: "Manage merchant verification, regulatory KYC/AML checks, and audit transaction records to adhere to national financial regulatory guidelines."
    },

    // --- 3. E-commerce (4 jobs) ---
    {
        title: "Senior Product Catalog Engineer",
        companyName: "Flipkart",
        location: "Bangalore",
        industry: "E-commerce",
        salary: 24, // 18-25 LPA
        experiencelevel: 5,
        jobType: "Hybrid",
        position: 3,
        requirements: ["Java", "Distributed Caching", "Elasticsearch", "Cassandra", "Kafka"],
        description: "Power the product discovery and search indexing engine for tens of millions of products with sub-50ms latency during peak holiday traffic."
    },
    {
        title: "Logistics Optimization Analyst",
        companyName: "Swiggy",
        location: "Delhi",
        industry: "E-commerce",
        salary: 10, // 8-12 LPA
        experiencelevel: 3,
        jobType: "Onsite",
        position: 2,
        requirements: ["Python", "SQL", "Supply Chain Optimization", "Tableau", "Operations Research"],
        description: "Optimize hyper-local delivery routes, dispatch algorithms, and warehouse stocking levels to reduce order fulfillment turnaround times."
    },
    {
        title: "E-commerce Category Operations Associate",
        companyName: "Flipkart",
        location: "Kolkata",
        industry: "E-commerce",
        salary: 3, // 0-3 LPA
        experiencelevel: 0,
        jobType: "Onsite",
        position: 5,
        requirements: ["Excel", "Category Management", "Vendor Coordination", "Inventory Tracking"],
        description: "Coordinate with sellers and brand merchants, track live inventory metrics, and ensure high-accuracy catalog categorization."
    },
    {
        title: "React Frontend Engineer (Checkout)",
        companyName: "Swiggy",
        location: "Chennai",
        industry: "E-commerce",
        salary: 15, // 12-18 LPA
        experiencelevel: 3,
        jobType: "Hybrid",
        position: 4,
        requirements: ["React", "TypeScript", "Performance Optimization", "Redux", "Tailwind CSS"],
        description: "Build ultra-fast, responsive web checkout flows. Implement A/B testing and drive conversion rate optimization for millions of daily shoppers."
    },

    // --- 4. EdTech (4 jobs) ---
    {
        title: "Interactive Learning Platform Lead",
        companyName: "Unacademy",
        location: "Bangalore",
        industry: "EdTech",
        salary: 20, // 18-25 LPA
        experiencelevel: 4,
        jobType: "Remote",
        position: 2,
        requirements: ["WebRTC", "Socket.io", "React", "Node.js", "Live Streaming"],
        description: "Lead development of low-latency interactive virtual classrooms with live quiz polling, screen sharing, and real-time student-educator interactions."
    },
    {
        title: "Curriculum Content Developer",
        companyName: "Unacademy",
        location: "Noida",
        industry: "EdTech",
        salary: 5, // 3-5 LPA
        experiencelevel: 1,
        jobType: "Hybrid",
        position: 4,
        requirements: ["Technical Writing", "Curriculum Design", "STEM Concepts", "Pedagogy"],
        description: "Develop engaging educational modules, problem sets, and interactive coding challenges for foundational computer science courses."
    },
    {
        title: "EdTech Student Success Advisor",
        companyName: "Unacademy",
        location: "Jaipur",
        industry: "EdTech",
        salary: 2.8, // 0-3 LPA
        experiencelevel: 0,
        jobType: "Onsite",
        position: 6,
        requirements: ["Student Mentorship", "Communication", "CRM Tools", "Problem Resolution"],
        description: "Guide newly enrolled students through course onboarding, monitor study progress milestones, and provide academic support."
    },
    {
        title: "Video Streaming Infrastructure Engineer",
        companyName: "Unacademy",
        location: "Pune",
        industry: "EdTech",
        salary: 11, // 8-12 LPA
        experiencelevel: 3,
        jobType: "Hybrid",
        position: 3,
        requirements: ["HLS", "FFmpeg", "AWS CloudFront", "Video Encoding", "CDN Optimization"],
        description: "Maintain and scale high-definition on-demand educational video pipelines ensuring buffer-free streaming across mobile network conditions."
    },

    // --- 5. HealthTech (4 jobs) ---
    {
        title: "Healthcare Data Platform Engineer",
        companyName: "Innovaccer",
        location: "Noida",
        industry: "HealthTech",
        salary: 17, // 12-18 LPA
        experiencelevel: 4,
        jobType: "Hybrid",
        position: 3,
        requirements: ["FHIR", "HL7", "Python", "Apache Spark", "HIPAA Compliance", "AWS"],
        description: "Design data ingestion pipelines normalizing electronic health records (EHR) into FHIR standards while strictly ensuring patient data security."
    },
    {
        title: "Telemedicine Full Stack Developer",
        companyName: "Practo",
        location: "Bangalore",
        industry: "HealthTech",
        salary: 12, // 8-12 LPA
        experiencelevel: 3,
        jobType: "Hybrid",
        position: 4,
        requirements: ["Node.js", "React", "PostgreSQL", "WebRTC", "Docker"],
        description: "Build reliable doctor-patient consultation portals supporting appointment booking, digital prescriptions, and encrypted video calling."
    },
    {
        title: "Clinical Operations Coordinator",
        companyName: "Practo",
        location: "Delhi",
        industry: "HealthTech",
        salary: 4, // 3-5 LPA
        experiencelevel: 1,
        jobType: "Onsite",
        position: 5,
        requirements: ["Medical Records", "Healthcare Coordination", "Clinic Onboarding", "EMR"],
        description: "Liaise with partnered diagnostic laboratories and multi-specialty clinics to streamline patient appointment scheduling and digital lab test delivery."
    },
    {
        title: "Medical AI Annotation Specialist",
        companyName: "Innovaccer",
        location: "Kolkata",
        industry: "HealthTech",
        salary: 3, // 0-3 LPA
        experiencelevel: 0,
        jobType: "Onsite",
        position: 4,
        requirements: ["Medical Terminology", "Data Annotation", "Clinical Documentation", "Attention to Detail"],
        description: "Label and annotate anonymized radiology records and clinical pathology summaries to train clinical diagnostic AI models."
    },

    // --- 6. AI / Machine Learning (4 jobs) ---
    {
        title: "Senior Machine Learning Scientist",
        companyName: "OpenAI Labs",
        location: "Bangalore",
        industry: "AI / Machine Learning",
        salary: 32, // 25+ LPA
        experiencelevel: 6,
        jobType: "Hybrid",
        position: 2,
        requirements: ["PyTorch", "Transformers", "LLMs", "Deep Learning", "Python", "GPU Clusters"],
        description: "Train and evaluate state-of-the-art transformer architectures for semantic search, generative reasoning, and embedding extraction."
    },
    {
        title: "Computer Vision Engineer",
        companyName: "Google",
        location: "Hyderabad",
        industry: "AI / Machine Learning",
        salary: 21, // 18-25 LPA
        experiencelevel: 4,
        jobType: "Hybrid",
        position: 3,
        requirements: ["OpenCV", "TensorFlow", "CNN", "Image Segmentation", "C++", "Python"],
        description: "Develop real-time computer vision models for object classification, facial landmark tracking, and edge device neural inference."
    },
    {
        title: "Junior NLP Data Analyst",
        companyName: "Innovaccer",
        location: "Gurugram",
        industry: "AI / Machine Learning",
        salary: 6, // 5-8 LPA
        experiencelevel: 1,
        jobType: "Onsite",
        position: 4,
        requirements: ["Python", "NLTK", "Pandas", "Scikit-Learn", "Text Preprocessing"],
        description: "Clean and curate large multilingual text corpora, evaluate model perplexity, and benchmark conversational agent responses."
    },
    {
        title: "MLOps & Pipeline Engineer",
        companyName: "OpenAI Labs",
        location: "Pune",
        industry: "AI / Machine Learning",
        salary: 15, // 12-18 LPA
        experiencelevel: 3,
        jobType: "Remote",
        position: 2,
        requirements: ["Kubeflow", "MLflow", "Docker", "Triton Server", "AWS SageMaker"],
        description: "Deploy scalable ML model inference endpoints with automated model drift monitoring, continuous retraining, and canary deployments."
    },

    // --- 7. Banking (4 jobs) ---
    {
        title: "Core Banking Systems Specialist",
        companyName: "HDFC Bank",
        location: "Mumbai",
        industry: "Banking",
        salary: 14, // 12-18 LPA
        experiencelevel: 4,
        jobType: "Onsite",
        position: 3,
        requirements: ["Core Banking Solutions", "Finacle", "Oracle DB", "PL/SQL", "High Availability"],
        description: "Oversee operational integrity and mission-critical batch processing of core banking ledger systems supporting millions of commercial accounts."
    },
    {
        title: "Cybersecurity Analyst (Banking)",
        companyName: "ICICI Bank",
        location: "Hyderabad",
        industry: "Banking",
        salary: 11, // 8-12 LPA
        experiencelevel: 3,
        jobType: "Onsite",
        position: 2,
        requirements: ["SIEM", "Incident Response", "VAPT", "Firewalls", "ISO 27001"],
        description: "Protect digital banking infrastructure from intrusion vectors. Monitor real-time security events, perform vulnerability assessments, and conduct penetration testing."
    },
    {
        title: "Retail Banking Branch Operations Officer",
        companyName: "HDFC Bank",
        location: "Delhi",
        industry: "Banking",
        salary: 4.5, // 3-5 LPA
        experiencelevel: 1,
        jobType: "Onsite",
        position: 8,
        requirements: ["Banking Operations", "Customer Relationship", "Financial Auditing", "KYC"],
        description: "Manage front-office customer accounts, verify clearing settlements, and cross-offer secure savings and investment banking instruments."
    },
    {
        title: "Junior Financial Credit Analyst",
        companyName: "ICICI Bank",
        location: "Chennai",
        industry: "Banking",
        salary: 7, // 5-8 LPA
        experiencelevel: 2,
        jobType: "Onsite",
        position: 4,
        requirements: ["Credit Risk Assessment", "Financial Modeling", "Balance Sheet Analysis", "Excel"],
        description: "Appraise SME loan applications, compute debt service coverage ratios (DSCR), and formulate structured credit underwriting proposals."
    },

    // --- 8. Consulting (4 jobs) ---
    {
        title: "Management Consultant - Digital Strategy",
        companyName: "McKinsey",
        location: "Gurugram",
        industry: "Consulting",
        salary: 26, // 25+ LPA
        experiencelevel: 5,
        jobType: "Hybrid",
        position: 2,
        requirements: ["Strategic Planning", "Digital Transformation", "Executive Communication", "Market Modeling"],
        description: "Advise Fortune 500 executive leadership on enterprise modernization, cloud migration ROI, and digital operating models."
    },
    {
        title: "Technology Advisory Consultant",
        companyName: "Deloitte",
        location: "Hyderabad",
        industry: "Consulting",
        salary: 13, // 12-18 LPA
        experiencelevel: 3,
        jobType: "Hybrid",
        position: 5,
        requirements: ["ERP Implementation", "Business Process Mapping", "Agile Consulting", "Client Management"],
        description: "Partner with corporate clients to evaluate legacy architectures, implement modern ERP systems, and streamline business operational workflows."
    },
    {
        title: "Business Intelligence Consultant",
        companyName: "Deloitte",
        location: "Chennai",
        industry: "Consulting",
        salary: 9.5, // 8-12 LPA
        experiencelevel: 2,
        jobType: "Onsite",
        position: 4,
        requirements: ["Power BI", "SQL", "Data Warehousing", "ETL", "Stakeholder Reporting"],
        description: "Design executive dashboards and automated reporting solutions translating complex enterprise metrics into actionable strategic insights."
    },
    {
        title: "Associate Research Consultant",
        companyName: "McKinsey",
        location: "Kolkata",
        industry: "Consulting",
        salary: 6, // 5-8 LPA
        experiencelevel: 1,
        jobType: "Hybrid",
        position: 3,
        requirements: ["Market Research", "Secondary Research", "Qualitative Analysis", "PowerPoint"],
        description: "Conduct secondary market research, benchmark competitor strategies, and prepare quantitative research decks for strategy engagements."
    },

    // --- 9. SaaS (4 jobs) ---
    {
        title: "Senior SaaS Product Manager",
        companyName: "Freshworks",
        location: "Chennai",
        industry: "SaaS",
        salary: 22, // 18-25 LPA
        experiencelevel: 5,
        jobType: "Hybrid",
        position: 2,
        requirements: ["Product Roadmap", "B2B SaaS Metrics", "User Stories", "Customer Interviews", "PLG"],
        description: "Define the product vision and feature roadmap for our enterprise helpdesk SaaS suite. Drive product-led growth (PLG) and retention metrics."
    },
    {
        title: "API Platform Developer",
        companyName: "Postman",
        location: "Bangalore",
        industry: "SaaS",
        salary: 16, // 12-18 LPA
        experiencelevel: 3,
        jobType: "Remote",
        position: 3,
        requirements: ["Node.js", "TypeScript", "REST APIs", "GraphQL", "WebSockets", "OAuth2"],
        description: "Build developer-first collaboration tools, mock servers, and automated API monitoring workflows used by over 30 million global developers."
    },
    {
        title: "Customer Success Technical Specialist",
        companyName: "Freshworks",
        location: "Pune",
        industry: "SaaS",
        salary: 7, // 5-8 LPA
        experiencelevel: 2,
        jobType: "Remote",
        position: 4,
        requirements: ["SaaS Onboarding", "JavaScript", "Webhooks", "Customer Support", "Troubleshooting"],
        description: "Assist enterprise clients in integrating SaaS APIs, configuring custom webhook alerts, and resolving advanced technical platform inquiries."
    },
    {
        title: "Sales Development Representative (B2B SaaS)",
        companyName: "Freshworks",
        location: "Delhi",
        industry: "SaaS",
        salary: 5, // 3-5 LPA
        experiencelevel: 1,
        jobType: "Onsite",
        position: 6,
        requirements: ["Outbound Prospecting", "CRM", "Email Outreach", "Lead Qualification"],
        description: "Identify high-potential B2B enterprise leads, conduct outbound product demos, and nurture relationships with IT decision makers."
    },

    // --- 10. Telecom (4 jobs) ---
    {
        title: "5G Core Network Architect",
        companyName: "Airtel",
        location: "Gurugram",
        industry: "Telecom",
        salary: 25, // 25+ LPA
        experiencelevel: 6,
        jobType: "Onsite",
        position: 2,
        requirements: ["5G Core", "LTE", "Network Slicing", "NFV/SDN", "SIP/VoLTE"],
        description: "Architect high-capacity 5G standalone (SA) packet core infrastructure and implement dynamic network slicing for low-latency enterprise services."
    },
    {
        title: "Optical Fiber Network Operations Lead",
        companyName: "Jio Platforms",
        location: "Mumbai",
        industry: "Telecom",
        salary: 10.5, // 8-12 LPA
        experiencelevel: 3,
        jobType: "Onsite",
        position: 4,
        requirements: ["DWDM", "Fiber Optics", "NMS", "Network Routing", "Telecom NOC"],
        description: "Manage tier-1 optical transmission networks, monitor DWDM link health, and ensure 99.999% uptime for national broadband backbones."
    },
    {
        title: "Telecom Field Engineer",
        companyName: "Airtel",
        location: "Noida",
        industry: "Telecom",
        salary: 4, // 3-5 LPA
        experiencelevel: 1,
        jobType: "Onsite",
        position: 8,
        requirements: ["Base Transceiver Station", "Tower Audits", "RF Measurement", "Troubleshooting"],
        description: "Perform on-site maintenance of cellular tower equipment, verify antenna RF propagation parameters, and troubleshoot transmission outages."
    },
    {
        title: "Telecom Graduate Engineer Trainee",
        companyName: "Jio Platforms",
        location: "Delhi",
        industry: "Telecom",
        salary: 3, // 0-3 LPA
        experiencelevel: 0,
        jobType: "Onsite",
        position: 10,
        requirements: ["B.Tech Electronics", "Telecommunications", "TCP/IP Basics", "Eagerness to Learn"],
        description: "Hands-on training program covering wireless communication networks, enterprise IP routing, and digital subscriber management systems."
    }
];

async function seedDatabase() {
    console.log("=== STARTING IDEMPOTENT DATABASE SEEDING ===");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB:", mongoose.connection.name);

    // 1. Get or create recruiter user
    let recruiter = await User.findOne({ role: "recruiter" });
    if (!recruiter) {
        console.log("Creating default recruiter user for company association...");
        recruiter = await User.create({
            fullname: "Lead Talent Recruiter",
            email: "talent@jobportal.dev",
            phoneNumber: 9876543210,
            password: "$2a$10$hashedpasswordplaceholder12345",
            role: "recruiter"
        });
    }
    console.log(`Using recruiter user: ${recruiter.fullname} (${recruiter._id})`);

    // 2. Upsert Companies
    const companyMap = new Map();
    for (const compData of COMPANIES_SEED) {
        let comp = await Company.findOne({ name: compData.name });
        if (!comp) {
            comp = await Company.create({
                name: compData.name,
                location: compData.location,
                website: compData.website,
                description: compData.description,
                userId: recruiter._id
            });
            console.log(`+ Created company: ${comp.name}`);
        } else {
            console.log(`? Existing company found: ${comp.name}`);
        }
        companyMap.set(comp.name, comp._id);
    }

    // 3. Upsert Jobs Idempotently
    let createdCount = 0;
    let skippedCount = 0;

    for (const jobData of JOBS_SEED) {
        const companyId = companyMap.get(jobData.companyName);
        if (!companyId) {
            console.warn(`Company ${jobData.companyName} not found, skipping job: ${jobData.title}`);
            continue;
        }

        // Check if identical job already exists
        const existingJob = await Job.findOne({
            title: jobData.title,
            company: companyId,
            location: jobData.location
        });

        if (existingJob) {
            // Update industry if missing
            if (!existingJob.industry && jobData.industry) {
                existingJob.industry = jobData.industry;
                await existingJob.save();
            }
            skippedCount++;
        } else {
            await Job.create({
                title: jobData.title,
                description: jobData.description,
                requirements: jobData.requirements,
                salary: jobData.salary,
                experiencelevel: jobData.experiencelevel,
                location: jobData.location,
                jobType: jobData.jobType,
                industry: jobData.industry,
                position: jobData.position,
                company: companyId,
                created_by: recruiter._id
            });
            createdCount++;
        }
    }

    console.log("\n==========================================");
    console.log("SEEDING SUMMARY:");
    console.log(`New Jobs Created: ${createdCount}`);
    console.log(`Existing Jobs Preserved: ${skippedCount}`);
    const totalJobs = await Job.countDocuments();
    console.log(`Total Jobs in Database: ${totalJobs}`);

    // Verification of coverage
    console.log("\n--- Location Distribution ---");
    for (const loc of LOCATIONS) {
        const count = await Job.countDocuments({ location: { $regex: loc, $options: "i" } });
        console.log(`  - ${loc}: ${count} jobs`);
    }

    console.log("\n--- Industry Distribution ---");
    for (const ind of INDUSTRIES) {
        const count = await Job.countDocuments({
            $or: [
                { industry: { $regex: ind, $options: "i" } },
                { title: { $regex: ind, $options: "i" } },
                { description: { $regex: ind, $options: "i" } }
            ]
        });
        console.log(`  - ${ind}: ${count} jobs`);
    }

    console.log("==========================================");

    await mongoose.disconnect();
    console.log("Database disconnected cleanly.");
}

seedDatabase().catch(err => {
    console.error("SEEDING FAILED:", err);
    process.exit(1);
});
