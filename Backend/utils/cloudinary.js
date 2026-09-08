import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

/**
 * Extracts publicId from Cloudinary URL handling version numbers and optional folder paths.
 */
export const getCloudinaryPublicId = (url) => {
    if (!url || typeof url !== 'string') return null;
    try {
        const urlObj = new URL(url);
        const uploadIndex = urlObj.pathname.indexOf('/upload/');
        if (uploadIndex === -1) return null;
        let afterUpload = urlObj.pathname.substring(uploadIndex + 8);
        const parts = afterUpload.split('/');
        const versionIndex = parts.findIndex(p => /^v\d+$/.test(p));
        let relevantParts = parts;
        if (versionIndex !== -1) {
            relevantParts = parts.slice(versionIndex + 1);
        } else {
            while (relevantParts.length > 1 && (relevantParts[0].includes(',') || /^[a-z]{1,3}_/.test(relevantParts[0]))) {
                relevantParts = relevantParts.slice(1);
            }
        }
        const pathWithExt = relevantParts.join('/');
        const lastDot = pathWithExt.lastIndexOf('.');
        return lastDot !== -1 ? pathWithExt.substring(0, lastDot) : pathWithExt;
    } catch {
        return null;
    }
};

/**
 * Generates an authenticated download/view URL for a Cloudinary PDF resume
 * so it can be opened directly in a new tab without 401 ACL/permission errors.
 */
export const getAccessibleResumeUrl = (storedUrl) => {
    if (!storedUrl) return "";
    const rawUrl = Array.isArray(storedUrl) ? storedUrl[0] : storedUrl;
    if (!rawUrl || typeof rawUrl !== 'string') return "";
    const cleanUrl = rawUrl.trim();
    if (!cleanUrl) return "";

    if (!cleanUrl.includes("res.cloudinary.com")) {
        if (cleanUrl.startsWith("//")) return "https:" + cleanUrl;
        if (!/^https?:\/\//i.test(cleanUrl)) return "https://" + cleanUrl;
        return cleanUrl;
    }

    try {
        const publicId = getCloudinaryPublicId(cleanUrl);
        if (!publicId) return cleanUrl;

        const isRaw = cleanUrl.includes("/raw/upload/");
        const format = cleanUrl.toLowerCase().endsWith(".pdf") ? "pdf" : undefined;

        // Generate signed URL with 7 days expiration
        const signedUrl = cloudinary.utils.private_download_url(publicId, format || "pdf", {
            resource_type: isRaw ? "raw" : "image",
            type: "upload",
            expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 3600)
        });

        return signedUrl || cleanUrl;
    } catch (err) {
        console.warn("Could not generate signed resume URL:", err.message);
        return cleanUrl;
    }
};

export default cloudinary;