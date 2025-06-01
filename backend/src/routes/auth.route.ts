import { Router } from "express";
import { adminTest, authenticateTest, login, signup } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middlewares/auth/authenticate";

const authRoutes: Router = Router();

authRoutes.post("/signup", asyncHandler(signup));
authRoutes.post("/login", asyncHandler(login));
authRoutes.post("/protected", [authenticate] , asyncHandler(authenticateTest));
authRoutes.post("/adminpage", asyncHandler(adminTest));


export default authRoutes;
