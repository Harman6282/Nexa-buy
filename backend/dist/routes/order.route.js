"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const authenticate_1 = require("../middlewares/auth/authenticate");
const order_controller_1 = require("../controllers/order.controller");
const orderRoutes = (0, express_1.Router)();
orderRoutes.post("/", [authenticate_1.authenticate], (0, asyncHandler_1.asyncHandler)(order_controller_1.createOrder));
orderRoutes.get("/", [authenticate_1.authenticate], (0, asyncHandler_1.asyncHandler)(order_controller_1.getAllOrders));
orderRoutes.get("/:id", [authenticate_1.authenticate], (0, asyncHandler_1.asyncHandler)(order_controller_1.getSingleOrder));
orderRoutes.put("/:id", [authenticate_1.authenticate], (0, asyncHandler_1.asyncHandler)(order_controller_1.cancelOrder));
exports.default = orderRoutes;
