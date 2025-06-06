import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { adminCheck, authenticate } from "../middlewares/auth/authenticate";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controller";
import { upload } from "../middlewares/multer";

const productRoutes: Router = Router();

productRoutes.post(
  "/create",
  [authenticate, adminCheck],
  upload.array("images", 5),
  asyncHandler(createProduct)
);
productRoutes.put(
  "/update/:id",
  [authenticate, adminCheck],
  asyncHandler(updateProduct)
);
productRoutes.delete(
  "/delete/:id",
  [authenticate, adminCheck],
  asyncHandler(deleteProduct)
);
productRoutes.get("/:id", asyncHandler(getProductById));
productRoutes.get("/", asyncHandler(getAllProducts));

export default productRoutes;
