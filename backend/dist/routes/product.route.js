"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const authenticate_1 = require("../middlewares/auth/authenticate");
const product_controller_1 = require("../controllers/product.controller");
const multer_1 = require("../middlewares/multer");
const productRoutes = (0, express_1.Router)();
productRoutes.post("/create", [authenticate_1.authenticate, authenticate_1.adminCheck], multer_1.upload.array("images", 5), (0, asyncHandler_1.asyncHandler)(product_controller_1.createProduct));
productRoutes.put("/update/:id", [authenticate_1.authenticate, authenticate_1.adminCheck], (0, asyncHandler_1.asyncHandler)(product_controller_1.updateProduct));
productRoutes.delete("/delete/:id", [authenticate_1.authenticate, authenticate_1.adminCheck], (0, asyncHandler_1.asyncHandler)(product_controller_1.deleteProduct));
productRoutes.get("/search", (0, asyncHandler_1.asyncHandler)(product_controller_1.getProductsByQuery));
productRoutes.get("/:id", (0, asyncHandler_1.asyncHandler)(product_controller_1.getProductById));
productRoutes.get("/", (0, asyncHandler_1.asyncHandler)(product_controller_1.getAllProducts));
productRoutes.get("/category/:id", (0, asyncHandler_1.asyncHandler)(product_controller_1.getProductsByCategory));
exports.default = productRoutes;
