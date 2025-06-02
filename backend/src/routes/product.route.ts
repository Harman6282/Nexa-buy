import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { adminCheck, authenticate } from "../middlewares/auth/authenticate";
import {
  createProduct,
  deleteProduct,
  getProductById,
  updateProduct,
} from "../controllers/product.controller";

const productRoutes: Router = Router();

productRoutes.post(
  "/create",
  [authenticate, adminCheck],
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

export default productRoutes;
