import { application } from "express";
import mongoose from "mongoose";
const jobSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    description:{
        type:String,
        required: true,
    },
    requirements:{
        type: [String],
        required:true,
    },
    salary:{
        type: Number,
        required:true,
    },
    experiencelevel:{
        type:Number,
        required:true
    },
    location:{
        type:String,
        required:true,
    },
    jobType:{
        type: String,
        required: true,
    },
    industry:{
        type: String,
        trim: true
    },
    position:{
        type: Number,
        required: true,
    },
    company:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    created_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    application:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
        }
    ],
    embedding: {
        type: [Number],
        select: false,
        default: []
    },
    embeddingUpdatedAt: {
        type: Date
    }
},{timestamps:true});
export const Job = mongoose.model("Job", jobSchema);