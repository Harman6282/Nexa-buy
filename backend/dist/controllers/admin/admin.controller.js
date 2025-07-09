"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.updateOrderStatus = void 0;
const __1 = require("../..");
const apiResponse_1 = require("../../utils/apiResponse");
const apiError_1 = require("../../utils/apiError");
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("first");
    const { id: orderId } = req.params;
    const { status } = req.body;
    if (!status) {
        throw new apiError_1.ApiError(400, "Status is required");
    }
    const order = yield __1.prisma.order.update({
        where: { id: orderId },
        data: { status },
    });
    if (!order) {
        throw new apiError_1.ApiError(404, "Order not found");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, order, "Order status updated successfully"));
});
exports.updateOrderStatus = updateOrderStatus;
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    if (!name) {
        throw new apiError_1.ApiError(400, "Category name is required");
    }
    const category = yield __1.prisma.category.create({
        data: { name },
    });
    if (!category) {
        throw new apiError_1.ApiError(400, "Failed to create category");
    }
    return res
        .status(201)
        .json(new apiResponse_1.ApiResponse(201, category, "Category created successfully"));
});
exports.createCategory = createCategory;
const updateCategory = (req, res) => {
    const { id: categoryId } = req.params;
    const { name } = req.body;
    if (!name) {
        throw new apiError_1.ApiError(400, "Category name is required");
    }
    const category = __1.prisma.category.update({
        where: { id: categoryId },
        data: { name },
    });
    if (!category) {
        throw new apiError_1.ApiError(400, "Failed to update category");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, category, "Category updated successfully"));
};
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => {
    const { id: categoryId } = req.params;
    const { name } = req.body;
    if (!name) {
        throw new apiError_1.ApiError(400, "Category name is required");
    }
    const category = __1.prisma.category.delete({
        where: { id: categoryId },
    });
    if (!category) {
        throw new apiError_1.ApiError(400, "Failed to delete category");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, category, "Category deleted successfully"));
};
exports.deleteCategory = deleteCategory;
