import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { adminCheck, authenticate } from "../middlewares/auth/authenticate";
import {
  createCategory,
  updateCategory,
  updateOrderStatus,
} from "../controllers/admin/admin.controller";

const adminRoutes: Router = Router();

adminRoutes.put(
  "/orderstatus/:id",
  [authenticate, adminCheck],
  asyncHandler(updateOrderStatus)
);
adminRoutes.post(
  "/category",
  [authenticate, adminCheck],
  asyncHandler(createCategory)
);
adminRoutes.put(
  "/category/:id",
  [authenticate, adminCheck],
  asyncHandler(updateCategory)
);
export default adminRoutes;
