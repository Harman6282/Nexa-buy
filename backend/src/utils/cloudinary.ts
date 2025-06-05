import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import {
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "../secrets";

// Cloudinary config
cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Upload function
const uploadFilesToCloudinary = async (filePaths: string[]): Promise<any[]> => {
  if (!filePaths || filePaths.length === 0) {
    throw new Error("No files provided for upload.");
  }

  if (filePaths.length > 5) {
    throw new Error("You can upload a maximum of 5 files.");
  }

  const uploadPromises = filePaths.map(async (filePath) => {
    try {
      const response = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto",
        timeout: 60000,
      });
      fs.unlinkSync(filePath); // Delete local file after upload
      return response;
    } catch (error) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Cleanup on failure too
      console.error(`Failed to upload ${filePath}:`, error);
      return null;
    }
  });

  const results = await Promise.all(uploadPromises);
  return results.filter(Boolean); // Remove nulls (failed uploads)
};

// Delete function
const deleteFilesFromCloudinary = async (publicIds: string[] | string): Promise<any> => {
  try {
    const ids = Array.isArray(publicIds) ? publicIds : [publicIds];

    if (ids.length === 0) {
      throw new Error("No public_id(s) provided for deletion.");
    }

    const response = await cloudinary.api.delete_resources(ids);
    console.log("Deleted resources:", response);
    return response;
  } catch (error) {
    console.error("Error while deleting files from Cloudinary:", error);
    throw error;
  }
};

export { uploadFilesToCloudinary, deleteFilesFromCloudinary };
