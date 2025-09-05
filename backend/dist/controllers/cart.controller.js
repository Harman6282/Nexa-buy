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
exports.clearCart = exports.removeItemFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const products_1 = require("../schema/products");
const apiError_1 = require("../utils/apiError");
const __1 = require("..");
const cache_1 = require("../utils/cache");
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = (req === null || req === void 0 ? void 0 : req.user).id;
    const cart_key = "cart";
    let cart;
    if (cache_1.cache.has(cart_key)) {
        cart = JSON.parse(cache_1.cache.get(cart_key));
    }
    {
        cart = yield __1.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: { include: { images: true } },
                        variant: true,
                    },
                },
            },
        });
        if (!cart) {
            cart = yield __1.prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            product: { include: { images: true } },
                            variant: true,
                        },
                    },
                },
            });
        }
        cache_1.cache.set(cart_key, JSON.stringify(cart));
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, cart, "Cart retrieved successfully"));
});
exports.getCart = getCart;
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = (req === null || req === void 0 ? void 0 : req.user).id;
    const parsed = products_1.AddToCartSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new apiError_1.ApiError(400, parsed.error.errors[0].message, parsed.error.errors.map((error) => error.path[0] + ": " + error.message));
    }
    let cart = yield __1.prisma.cart.findUnique({
        where: { userId },
    });
    if (!cart) {
        cart = yield __1.prisma.cart.create({
            data: {
                userId,
            },
        });
    }
    const existingItem = yield __1.prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId: parsed.data.productId,
            variantId: parsed.data.variantId,
        },
    });
    if (existingItem) {
        const updatedItem = yield __1.prisma.cartItem.update({
            where: {
                id: existingItem.id,
            },
            data: {
                quantity: existingItem.quantity + (parsed.data.quantity || 1),
            },
        });
        return res
            .status(200)
            .json(new apiResponse_1.ApiResponse(200, updatedItem, "Item quantity updated"));
    }
    else {
        const newItem = yield __1.prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: parsed.data.productId,
                variantId: parsed.data.variantId,
                quantity: parsed.data.quantity,
            },
        });
        cache_1.cache.del("cart");
        return res
            .status(200)
            .json(new apiResponse_1.ApiResponse(200, newItem, "Item added to cart"));
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, "Item added to cart"));
});
exports.addToCart = addToCart;
const updateCartItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //  Update quantity/variant
    const userId = req.user.id;
    const cartItemId = req.params.id;
    const { quantity, variantId } = req.body;
    const cart = yield __1.prisma.cart.findUnique({
        where: { userId },
    });
    if (!cart) {
        throw new apiError_1.ApiError(404, "Cart not found");
    }
    const cartItem = yield __1.prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            id: cartItemId,
        },
    });
    if (!cartItem) {
        throw new apiError_1.ApiError(404, "Cart item not found");
    }
    const updateItem = yield __1.prisma.cartItem.update({
        where: { id: cartItemId },
        data: {
            quantity: quantity || cartItem.quantity,
            variantId: variantId || cartItem.variantId,
        },
    });
    cache_1.cache.del("cart");
    return res.status(200).json(new apiResponse_1.ApiResponse(200, updateItem, "Item updated"));
});
exports.updateCartItem = updateCartItem;
const removeItemFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const cartItemId = req.params.id;
    const cart = yield __1.prisma.cart.findUnique({
        where: { userId },
    });
    if (!cart) {
        throw new apiError_1.ApiError(404, "Cart not found");
    }
    const cartItem = yield __1.prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            id: cartItemId,
        },
    });
    if (!cartItem) {
        throw new apiError_1.ApiError(404, "Cart item not found");
    }
    yield __1.prisma.cartItem.delete({
        where: {
            cartId: cart.id,
            id: cartItemId,
        },
    });
    cache_1.cache.del("cart");
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, cartItem, "Item removed from cart"));
});
exports.removeItemFromCart = removeItemFromCart;
const clearCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = (req === null || req === void 0 ? void 0 : req.user).id;
    const cart = yield __1.prisma.cart.findUnique({
        where: { userId },
    });
    if (!cart) {
        throw new apiError_1.ApiError(404, "Cart not found");
    }
    yield __1.prisma.cartItem.deleteMany({
        where: {
            cartId: cart.id,
        },
    });
    cache_1.cache.del("cart");
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, null, "Cart cleared successfully"));
});
exports.clearCart = clearCart;
