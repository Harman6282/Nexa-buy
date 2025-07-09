"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
function fileFilter(req, file, cb) {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp") {
        cb(null, true); // Accept file
    }
    else {
        cb(new Error("Only .jpg, .jpeg, .png, and .webp formats are allowed!"));
    }
}
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
});
