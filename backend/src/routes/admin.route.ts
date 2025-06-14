import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { adminCheck, authenticate } from "../middlewares/auth/authenticate";
import {
  createCategory,
  updateOrderStatus,
} from "../controllers/admin/admin.controller";

const adminRoutes: Router = Router();

adminRoutes.put("/orderstatus/:id", asyncHandler(updateOrderStatus));
adminRoutes.post(
  "/category",
  authenticate,
  adminCheck,
  asyncHandler(createCategory)
);
export default adminRoutes;
