import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middlewares/auth/authenticate";
import {
  addToWishlist,
  clearwishlist,
  deleteFromwishlist,
  getWishlist,
} from "../controllers/wishlist.controller";
const wishlistRoutes: Router = Router();

wishlistRoutes.get("/", [authenticate], asyncHandler(getWishlist));
wishlistRoutes.post("/", [authenticate], asyncHandler(addToWishlist));
wishlistRoutes.delete("/:id", [authenticate], asyncHandler(deleteFromwishlist));
wishlistRoutes.delete("/clear/all", [authenticate], asyncHandler(clearwishlist));

export default wishlistRoutes;
