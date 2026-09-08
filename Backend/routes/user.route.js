import express from "express";
import { getResumeAnalysis, login, logout, register, updateProfile, uploadAndAnalyzeResume } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";
 
const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated, singleUpload, updateProfile);
router.route("/resume/upload-and-analyze").post(isAuthenticated, singleUpload, uploadAndAnalyzeResume);
router.route("/resume/analysis").get(isAuthenticated, getResumeAnalysis);

export default router;

