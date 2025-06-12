import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middlewares/auth/authenticate";
import {} from "../controllers/product.controller";
import {
  addToCart,
  clearCart,
  getCart,
  removeItemFromCart,
  updateCartItem,
} from "../controllers/cart.controller";

const cartRoutes: Router = Router();

cartRoutes.post("/add", [authenticate], asyncHandler(addToCart));
cartRoutes.put("/update/:id", [authenticate], asyncHandler(updateCartItem));
cartRoutes.delete(
  "/delete/:id",
  [authenticate],
  asyncHandler(removeItemFromCart)
);
cartRoutes.get("/", [authenticate], asyncHandler(getCart));
cartRoutes.delete("/clear", [authenticate], asyncHandler(clearCart));
export default cartRoutes;
