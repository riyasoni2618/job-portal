import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";


// ==============================
// Register a new company
// ==============================
export const registerCompany = async (req, res) => {
  try {
    console.log("🔐 Register Company - User ID from token:", req.id);
    console.log("📥 Request body:", req.body);
    console.log("🍪 Cookies:", req.cookies);
    
    const { companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({
        message: "Company name is required.",
        success: false,
      });
    }

    if (!req.id) {
      console.log("❌ No user ID found - authentication failed");
      return res.status(401).json({
        message: "User not authenticated. Please login again.",
        success: false,
      });
    }

    let company = await Company.findOne({ name: companyName });
    if (company) {
      return res.status(400).json({
        message: "You can't register the same company again.",
        success: false,
      });
    }

    company = await Company.create({
      name: companyName,
      userId: req.id,
    });

    console.log("✅ Company created successfully:", company._id);
    return res.status(201).json({
      message: "Company registered successfully.",
      company,
      success: true,
    });
  } catch (error) {
    console.log("❌ Error in registerCompany:", error);
    return res.status(500).json({
      message: error.message || "Server error while registering company.",
      success: false,
    });
  }
};

// ==============================
// Get all companies by logged-in user
// ==============================
export const getCompany = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated.",
        success: false,
      });
    }

    const companies = await Company.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      companies: companies || [],
      success: true,
    });
  } catch (error) {
    console.log("Error in getCompany:", error);
    return res.status(500).json({
      message: "Server error while fetching companies.",
      success: false,
    });
  }
};

// ==============================
// Get company by ID
// ==============================
export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
        success: false,
      });
    }

    return res.status(200).json({
      company,
      success: true,
    });
  } catch (error) {
    console.log("Error in getCompanyById:", error);
    return res.status(500).json({
      message: "Server error while fetching company.",
      success: false,
    });
  }
};

// ==============================
// Update company info (with optional logo upload)
// ==============================
export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const file = req.file;

    const existingCompany = await Company.findById(req.params.id);
    if (!existingCompany) {
      return res.status(404).json({
        message: "Company not found.",
        success: false,
      });
    }

    if (existingCompany.userId.toString() !== req.id) {
      return res.status(403).json({
        message: "You are not authorized to update this company.",
        success: false,
      });
    }

    // optional logo upload (only if file exists)
    let logo;
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      logo = cloudResponse.secure_url;
    }

    // build update object dynamically
    const updateData = { name, description, website, location };
    if (logo) updateData.logo = logo;

    const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    return res.status(200).json({
      message: "Company information updated successfully.",
      company,
      success: true,
    });
  } catch (error) {
    console.log("Error in updateCompany:", error);
    return res.status(500).json({
      message: "Server error while updating company.",
      success: false,
    });
  }
};