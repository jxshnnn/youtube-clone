import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ✅ Cloudinary configuration (DO NOT rename variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    // safety check
    if (!localFilePath) return null;

    // 🔹 upload file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // 🔹 remove local temp file AFTER successful upload
    fs.unlinkSync(localFilePath);

    // 🔹 return full response
    return response;
  } catch (error) {
    // 🔹 remove file if upload fails
    try {
      if (localFilePath) fs.unlinkSync(localFilePath);
    } catch (e) {}

    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export { uploadOnCloudinary };
