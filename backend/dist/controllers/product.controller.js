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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByCategory = exports.getProductsByQuery = exports.getAllProducts = exports.getProductById = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const products_1 = require("../schema/products");
const apiError_1 = require("../utils/apiError");
const slugify_1 = __importDefault(require("slugify"));
const nanoid_1 = require("nanoid");
const __1 = require("..");
const cloudinary_1 = require("../utils/cloudinary");
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("createProduct called");
    if (typeof req.body.variants === "string") {
        try {
            req.body.variants = JSON.parse(req.body.variants);
        }
        catch (err) {
            throw new apiError_1.ApiError(400, "Invalid JSON format for 'variants'");
        }
    }
    const parsed = products_1.CreateProductSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new apiError_1.ApiError(400, parsed.error.errors[0].message, parsed.error.errors.map((error) => error.path[0] + ": " + error.message));
    }
    const { name, description, price, brand, discount, categoryId, variants } = parsed.data;
    // upload images
    const files = req.files;
    if (!files || files.length === 0) {
        throw new apiError_1.ApiError(400, "At least one product image is required");
    }
    const uploadedImages = [];
    for (const file of files) {
        const result = yield (0, cloudinary_1.uploadOnCloudinary)(file.path);
        uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
        });
    }
    // Map image data for Prisma
    const slug = (0, slugify_1.default)(name, { replacement: "-", lower: true }) + "-" + (0, nanoid_1.nanoid)(8);
    const product = yield __1.prisma.product.create({
        data: {
            name,
            description,
            price,
            brand,
            discount,
            slug,
            categoryId,
            images: {
                create: uploadedImages,
            },
            variants: {
                create: variants,
            },
        },
        include: {
            images: true,
            variants: true,
        },
    });
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, product, "product created successfully"));
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: productId } = req.params;
    if (!productId) {
        throw new apiError_1.ApiError(401, "Enter valid product Id");
    }
    const body = req.body;
    const product = yield __1.prisma.product.update({
        where: {
            id: productId,
        },
        data: Object.assign({}, body),
    });
    if (!product) {
        throw new apiError_1.ApiError(404, "Product not found");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, product, "product updated successfully"));
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: productId } = req.params;
    if (!productId) {
        throw new apiError_1.ApiError(401, "Enter valid product Id");
    }
    const product = yield __1.prisma.product.delete({
        where: {
            id: productId,
        },
    });
    if (!product) {
        throw new apiError_1.ApiError(404, "Product not found");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, "Product deleted successfully"));
});
exports.deleteProduct = deleteProduct;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("getProductById called");
    const { id: productId } = req.params;
    if (!productId) {
        throw new apiError_1.ApiError(401, "Enter valid product Id");
    }
    const product = yield __1.prisma.product.findFirst({
        where: {
            id: productId,
        },
        include: {
            category: true,
            images: true,
            variants: true,
        },
    });
    if (!product) {
        throw new apiError_1.ApiError(404, "Product not found");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, product, "product found"));
});
exports.getProductById = getProductById;
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield __1.prisma.product.findMany({
        include: {
            category: true,
            images: true,
            variants: true,
        },
    });
    if (!products) {
        throw new apiError_1.ApiError(404, "Error fetching products");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, products, "products found"));
});
exports.getAllProducts = getAllProducts;
const getProductsByQuery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const q = req.query.q;
    const products = yield __1.prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { brand: { contains: q, mode: "insensitive" } },
            ],
        },
        include: {
            category: true,
            images: true,
            variants: true,
        },
    });
    if (!products || products.length === 0) {
        throw new apiError_1.ApiError(404, "No products found");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, products, "products found"));
});
exports.getProductsByQuery = getProductsByQuery;
const getProductsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: categoryId } = req.params;
    if (!categoryId) {
        throw new apiError_1.ApiError(401, "Enter valid category Id");
    }
    const products = yield __1.prisma.product.findMany({
        where: {
            categoryId,
        },
        include: {
            category: true,
            images: true,
            variants: true,
        },
    });
    if (!products) {
        throw new apiError_1.ApiError(404, "No products found");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, products, "products found"));
});
exports.getProductsByCategory = getProductsByCategory;
