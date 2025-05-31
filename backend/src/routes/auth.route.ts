import { Router } from "express";
import { login, signup } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";

const authRoutes: Router = Router();

authRoutes.post("/signup", asyncHandler(signup));
authRoutes.post("/login", asyncHandler(login));

export default authRoutes;
