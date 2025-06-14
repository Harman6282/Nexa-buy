

import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { adminCheck, authenticate } from "../middlewares/auth/authenticate";
import { updateOrderStatus } from "../controllers/admin/admin.controller";

const adminRoutes: Router = Router();

adminRoutes.put("/signup", asyncHandler(updateOrderStatus));
export default adminRoutes;