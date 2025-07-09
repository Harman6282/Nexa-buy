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
exports.cancelOrder = exports.getSingleOrder = exports.getAllOrders = exports.createOrder = void 0;
const apiError_1 = require("../utils/apiError");
const __1 = require("..");
const apiResponse_1 = require("../utils/apiResponse");
const products_1 = require("../schema/products");
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("triggerd");
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    const parsed = products_1.CreateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new apiError_1.ApiError(400, parsed.error.errors[0].message, parsed.error.errors);
    }
    const { cartId, addressId } = parsed.data;
    const cart = yield __1.prisma.cart.findUnique({
        where: { id: cartId },
        include: {
            items: {
                include: {
                    product: true,
                    variant: true,
                },
            },
        },
    });
    if (!cart || cart.userId !== userId || cart.items.length === 0) {
        throw new apiError_1.ApiError(404, "Invalid cart");
    }
    const address = yield __1.prisma.address.findUnique({
        where: { id: addressId },
    });
    if (!address || address.userId !== userId) {
        throw new apiError_1.ApiError(404, "Invalid address");
    }
    const total = cart.items.reduce((acc, item) => {
        return acc + item.quantity * item.product.price;
    }, 0);
    const newOrder = yield __1.prisma.order.create({
        data: {
            userId,
            address: `${address.lineOne}, ${address.lineTwo}, ${address.city}, ${address.state}, ${address.pincode}, ${address.country}`,
            items: {
                create: cart.items.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
            },
            total: total,
        },
        include: {
            items: {
                include: {
                    product: true,
                    variant: true,
                },
            },
        },
    });
    yield __1.prisma.cartItem.deleteMany({
        where: { cartId },
    });
    return res
        .status(201)
        .json(new apiResponse_1.ApiResponse(201, newOrder, "Order created successfully"));
});
exports.createOrder = createOrder;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    const orders = yield __1.prisma.order.findMany({
        where: { userId },
        include: {
            items: {
                include: {
                    variant: true,
                    product: {
                        include: {
                            images: true,
                        },
                    },
                },
            },
        },
    });
    if (!orders || orders.length === 0) {
        throw new apiError_1.ApiError(404, "No orders found");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, orders, "Orders fetched successfully"));
});
exports.getAllOrders = getAllOrders;
const getSingleOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    const orderId = req.params.id;
    const order = yield __1.prisma.order.findUnique({
        where: { id: orderId, userId },
        include: {
            items: {
                include: {
                    variant: true,
                    product: {
                        include: {
                            images: true,
                        },
                    },
                },
            },
        },
    });
    if (!order) {
        throw new apiError_1.ApiError(404, "Order not found");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, order, "Order fetched successfully"));
});
exports.getSingleOrder = getSingleOrder;
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    const orderId = req.params.id;
    const order = yield __1.prisma.order.findUnique({
        where: { id: orderId, userId },
    });
    if (!order) {
        throw new apiError_1.ApiError(404, "Order not found");
    }
    if (order.status === "CANCELLED") {
        throw new apiError_1.ApiError(400, "Order is already cancelled");
    }
    const updatedOrder = yield __1.prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
    });
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, updatedOrder, "Order cancelled successfully"));
});
exports.cancelOrder = cancelOrder;
