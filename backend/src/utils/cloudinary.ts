import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import {
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "../secrets";
import { ApiError } from "./apiError";

// Cloudinary config
cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Upload function
const uploadOnCloudinary = async (localFilePath: string) => {
  if (!localFilePath) {
    throw new ApiError(400, "Image is required");
  }
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "images",
      timeout: 60000,
    });


    fs.unlinkSync(localFilePath); // delete after successful upload
    return response;
  } catch (error: any) {
    // clean up even if upload fails
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (unlinkErr) {
        console.warn("Error deleting file:", unlinkErr);
      }
    }

    console.log(error);

    throw new ApiError(500, "Cloudinary upload failed", [
      error?.message || error,
    ]);
  }
};

// Delete function
const deleteFromCloudinary = async (public_id: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) {
        console.error("Error while deleting from Cloudinary:", error);
      }
    });
  } catch (err) {
    console.error("Unexpected error while deleting from Cloudinary:", err);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
