import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

function fileFilter(
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp") {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Only .jpg, .jpeg, .png, and .webp formats are allowed!"));
  }
}

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});
