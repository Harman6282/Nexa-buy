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
exports.clearwishlist = exports.deleteFromwishlist = exports.getWishlist = exports.addToWishlist = void 0;
const __1 = require("..");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
const addToWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { productId } = req.body;
    if (!productId) {
        throw new apiError_1.ApiError(400, "Product Id is required");
    }
    // Check if product already in wishlist
    const existingItem = yield __1.prisma.wishlist.findFirst({
        where: {
            productId,
            userId,
        },
    });
    if (existingItem) {
        // If exists, remove it
        yield __1.prisma.wishlist.delete({
            where: {
                id: existingItem.id,
            },
        });
        return res
            .status(200)
            .json(new apiResponse_1.ApiResponse(200, null, "Removed from wishlist"));
    }
    // If not exists, add it
    const newItem = yield __1.prisma.wishlist.create({
        data: {
            userId,
            productId,
        },
    });
    if (!newItem) {
        throw new apiError_1.ApiError(500, "Error while adding to wishlist");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, newItem, "Added to wishlist"));
});
exports.addToWishlist = addToWishlist;
const getWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log("first");
        const wishlist = yield __1.prisma.wishlist.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        slug: true,
                        images: {
                            select: {
                                url: true,
                            },
                            take: 1,
                        },
                    },
                },
            },
        });
        if (!wishlist || wishlist.length === 0) {
            throw new apiError_1.ApiError(404, "Wishlist not found");
        }
        const formattedWishlist = wishlist.map((item) => {
            var _a;
            return ({
                id: item.id,
                productId: item.productId,
                name: item.product.name,
                price: item.product.price,
                image: ((_a = item.product.images[0]) === null || _a === void 0 ? void 0 : _a.url) || null,
                createdAt: item.createdAt,
            });
        });
        res
            .status(200)
            .json(new apiResponse_1.ApiResponse(200, formattedWishlist, "Wishlist fetched successfully"));
    }
    catch (error) {
        throw new apiError_1.ApiError(500, "Something went wrong");
    }
});
exports.getWishlist = getWishlist;
const deleteFromwishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!id) {
        throw new apiError_1.ApiError(400, "wishlist product id is required");
    }
    const wishlist = yield __1.prisma.wishlist.delete({
        where: {
            id,
            userId,
        },
    });
    if (!wishlist) {
        throw new apiError_1.ApiError(404, "Error while deleting wishlist product ");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, wishlist, "wishlist fetched successfully"));
});
exports.deleteFromwishlist = deleteFromwishlist;
const clearwishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    const wishlist = yield __1.prisma.wishlist.deleteMany({
        where: userId,
    });
    if (wishlist) {
        throw new apiError_1.ApiError(404, "wishlist not found");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, null, "wishlist deleted successfully"));
});
exports.clearwishlist = clearwishlist;
