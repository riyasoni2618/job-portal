import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { getAccessibleResumeUrl } from "../utils/cloudinary.js";
export const applyJob = async(req,res)=>{
    try {
        const userId  =req.id;
        const jobId = req.params.id;
        if(!jobId){
            return res.status(400).json({
                message:"Job id is required.",
                success: false
            })
        };
        const existingApplication = await Application.findOne({job:jobId,applicant:userId});
        if(existingApplication){
            return res.status(400).json({
                message: "You have already applied for this year",
                success:false
            });
        }
        const job = await Job.findById(jobId);
        if(!job){
            return res.status(404).json({
                message: "job not found",
                success:false
            });
        }
        const newApplication = await Application.create({
            job: jobId,
            applicant:userId,
        });
        job.application.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message:"job applied successfully.",
            success: true
        })
    } catch (error) {
        console.log("Apply Job Error:", error);
        return res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false
        });
    }
};

export const getAppliedJobs = async (req,res)=>{
    try {
        const userId = req.id;
        const application = await Application.find({applicant:userId}).sort({createdAt:-1}).populate({
            path:'job',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'company',
                options:{sort:{createdAt:-1}},
            }
        });
        // Application.find() returns an array, so check length instead
        return res.status(200).json({
            application: application || [],
            success:true
        })
    } catch (error) {
        console.log("Get Applied Jobs Error:", error);
        return res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false
        });
    }
}
//admin dekhega kitne logo n apply kiya h
export const getApplicants = async (req,res)=>{
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:'application',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'applicant',
            }
        });
        if(!job){
            return res.status(404).json({
                message:"job not found",
                success:false
            })
        };

        const jobObj = job.toObject();
        if (jobObj.application && Array.isArray(jobObj.application)) {
            jobObj.application = jobObj.application.map(app => {
                if (app.applicant?.profile) {
                    app.applicant.profile.resume = getAccessibleResumeUrl(app.applicant.profile.resume);
                }
                return app;
            });
        }

        return res.status(200).json({
            job: jobObj,
            success:true
        })
    } catch (error) {
        console.log("Get Applicants Error:", error);
        return res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false
        });
    }
}
//check by user that application is reject or acepted or pending
export const updateStatus = async (req,res)=>{
    try {
        const {status} = req.body;
        const applicationId = req.params.id;
        if(!status){
            return res.status(400).json({
                message:'status is required',
                success: false
            })
        };
        //find the application by applicants id
        const application  =await Application.findOne({_id:applicationId});
        if(!application){
            return res.status(404).json({
                message:"Application not found",
                success:false
            })
        };
        // update the status
        application.status= status.toLowerCase();
        await application.save();
        return res.status(200).json({
            message:"status update successfully",
            success:true
        });
    } catch (error) {
        console.log("Update Status Error:", error);
        return res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false
        });
    }
}
