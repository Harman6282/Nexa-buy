"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadOnCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const secrets_1 = require("../secrets");
const apiError_1 = require("./apiError");
// Cloudinary config
cloudinary_1.v2.config({
    cloud_name: secrets_1.CLOUDINARY_NAME,
    api_key: secrets_1.CLOUDINARY_API_KEY,
    api_secret: secrets_1.CLOUDINARY_API_SECRET,
});
// Upload function
const uploadOnCloudinary = (localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    if (!localFilePath) {
        throw new apiError_1.ApiError(400, "Image is required");
    }
    console.log("localfilepath", localFilePath);
    try {
        const response = yield cloudinary_1.v2.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "images",
            timeout: 60000,
        });
        console.log("response: ", response);
        fs_1.default.unlinkSync(localFilePath); // delete after successful upload
        return response;
    }
    catch (error) {
        // clean up even if upload fails
        if (fs_1.default.existsSync(localFilePath)) {
            try {
                fs_1.default.unlinkSync(localFilePath);
            }
            catch (unlinkErr) {
                console.warn("Error deleting file:", unlinkErr);
            }
        }
        console.log(error);
        throw new apiError_1.ApiError(500, "Cloudinary upload failed", [
            (error === null || error === void 0 ? void 0 : error.message) || error,
        ]);
    }
});
exports.uploadOnCloudinary = uploadOnCloudinary;
// Delete function
const deleteFromCloudinary = (public_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield cloudinary_1.v2.uploader.destroy(public_id, (error, result) => {
            if (error) {
                console.error("Error while deleting from Cloudinary:", error);
            }
        });
    }
    catch (err) {
        console.error("Unexpected error while deleting from Cloudinary:", err);
    }
});
exports.deleteFromCloudinary = deleteFromCloudinary;
