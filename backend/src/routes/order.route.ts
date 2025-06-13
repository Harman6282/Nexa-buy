import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middlewares/auth/authenticate";
import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getSingleOrder,
} from "../controllers/order.controller";

const orderRoutes: Router = Router();

orderRoutes.post("/", [authenticate], asyncHandler(createOrder));
orderRoutes.get("/", [authenticate], asyncHandler(getAllOrders));
orderRoutes.get("/:id", [authenticate], asyncHandler(getSingleOrder));
orderRoutes.put("/:id", [authenticate], asyncHandler(cancelOrder));


export default orderRoutes