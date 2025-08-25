import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middlewares/auth/authenticate";
import { addToWishlist, clearwishlist, getWishlist } from "../controllers/wishlist.controller";
const wishlistRoutes: Router = Router();

wishlistRoutes.get("/", [authenticate], asyncHandler(getWishlist));
wishlistRoutes.post("/", [authenticate], asyncHandler(addToWishlist));
wishlistRoutes.delete("/clear", [authenticate], asyncHandler(clearwishlist));
export default wishlistRoutes;
