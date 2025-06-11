import { Router } from "express";
import {
  adminTest,
  authenticateTest,
  login,
  logout,
  signup,
} from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { adminCheck, authenticate } from "../middlewares/auth/authenticate";

const authRoutes: Router = Router();

authRoutes.post("/signup", asyncHandler(signup));
authRoutes.post("/login", asyncHandler(login));
authRoutes.post("/logout", [authenticate], asyncHandler(logout));
authRoutes.post("/protected", [authenticate], asyncHandler(authenticateTest));
authRoutes.post(
  "/adminpage",
  [authenticate, adminCheck],
  asyncHandler(adminTest)
);

export default authRoutes;
