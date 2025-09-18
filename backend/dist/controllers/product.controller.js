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
exports.getProductsByCategory = exports.getProductsByQuery = exports.getAllProducts = exports.getProductById = exports.collectionProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const products_1 = require("../schema/products");
const apiError_1 = require("../utils/apiError");
const slugify_1 = __importDefault(require("slugify"));
const nanoid_1 = require("nanoid");
const __1 = require("..");
const cloudinary_1 = require("../utils/cloudinary");
const cache_1 = require("../utils/cache");
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Parse variants if sent as string
    if (typeof req.body.variants === "string") {
        try {
            req.body.variants = JSON.parse(req.body.variants);
        }
        catch (err) {
            throw new apiError_1.ApiError(400, "Invalid JSON format for 'variants'");
        }
    }
    // Validate input
    const parsed = products_1.CreateProductSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new apiError_1.ApiError(400, parsed.error.errors[0].message, parsed.error.errors.map((error) => error.path[0] + ": " + error.message));
    }
    const { name, description, price, brand, discount, categoryName, variants } = parsed.data;
    // Get uploaded files
    const files = req.files;
    if (!files || files.length === 0) {
        throw new apiError_1.ApiError(400, "At least one product image is required");
    }
    // Upload each file to Cloudinary
    const uploadedImages = [];
    for (const file of files) {
        const result = yield (0, cloudinary_1.uploadOnCloudinary)(file.path);
        uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
        });
    }
    // Create product with uploaded images
    const slug = (0, slugify_1.default)(name, { replacement: "-", lower: true }) + "-" + (0, nanoid_1.nanoid)(8);
    const product = yield __1.prisma.product.create({
        data: {
            name,
            description,
            price,
            brand,
            discount,
            slug,
            categoryName,
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
        .json(new apiResponse_1.ApiResponse(200, product, "Product created successfully"));
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: productId } = req.params;
    if (!productId) {
        throw new apiError_1.ApiError(401, "Enter valid product Id");
    }
    const { name, description, price, brand, discount, categoryName, variants } = req.body;
    try {
        const result = yield __1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Update product
            const product = yield tx.product.update({
                where: { id: productId },
                data: {
                    name,
                    description,
                    price,
                    discount,
                    brand,
                    categoryName,
                },
            });
            if (!product)
                throw new apiError_1.ApiError(404, "Product not found");
            // 2. Get existing variants from DB
            const existingVariants = yield tx.productVariant.findMany({
                where: { productId },
            });
            const incomingIds = variants
                .filter((v) => v.id)
                .map((v) => v.id);
            const existingIds = existingVariants.map((v) => v.id);
            // 3. Delete variants that are missing in the request
            const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
            if (toDelete.length > 0) {
                yield tx.productVariant.deleteMany({
                    where: { id: { in: toDelete } },
                });
            }
            // 4. Upsert variants (update existing, create new)
            const updatedVariants = yield Promise.all(variants.map((v) => v.id
                ? tx.productVariant.update({
                    where: { id: v.id },
                    data: { size: v.size, stock: v.stock },
                })
                : tx.productVariant.create({
                    data: { size: v.size, stock: v.stock, productId },
                })));
            if (!updatedVariants) {
                throw new apiError_1.ApiError(404, "Failed to update variants while updating product");
            }
            return { product, variants: updatedVariants };
        }));
        return res
            .status(200)
            .json(new apiResponse_1.ApiResponse(200, result, "Product updated successfully"));
    }
    catch (error) {
        console.error(error);
        throw new apiError_1.ApiError(500, "Something went wrong while updating product");
    }
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
const collectionProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let products;
    const cachekey = "collection_products";
    if (cache_1.cache.has(cachekey)) {
        products = JSON.parse(cache_1.cache.get(cachekey));
    }
    else {
        products = yield __1.prisma.product.findMany({
            include: {
                images: true,
            },
            take: 4,
        });
        cache_1.cache.set(cachekey, JSON.stringify(products));
    }
    if (!products || products.length === 0) {
        throw new apiError_1.ApiError(404, "No products found in this collection");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, products, "products found"));
});
exports.collectionProducts = collectionProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (isNaN(page) || isNaN(limit)) {
        throw new apiError_1.ApiError(400, "Invalid page or limit parameter");
    }
    if (page < 1 || limit < 1) {
        throw new apiError_1.ApiError(400, "Page and limit must be greater than 0");
    }
    if (limit > 100) {
        throw new apiError_1.ApiError(400, "Limit cannot exceed 100");
    }
    const cacheKey = `products_page_${page}_limit_${limit}`;
    let products;
    let totalProducts;
    if (cache_1.cache.has(cacheKey) && cache_1.cache.has("totalProducts")) {
        products = JSON.parse(cache_1.cache.get(cacheKey));
        totalProducts = JSON.parse(cache_1.cache.get("totalProducts"));
    }
    else {
        products = yield __1.prisma.product.findMany({
            include: {
                category: true,
                images: true,
                variants: true,
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        });
        totalProducts = yield __1.prisma.product.count();
        cache_1.cache.set(cacheKey, JSON.stringify(products));
        cache_1.cache.set("totalProducts", JSON.stringify(totalProducts));
    }
    const totalPages = Math.ceil(totalProducts / limit);
    if (!products) {
        throw new apiError_1.ApiError(404, "Error fetching products");
    }
    if (products.length === 0) {
        throw new apiError_1.ApiError(404, "No products found");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, { products, totalPages }, "Products found"));
});
exports.getAllProducts = getAllProducts;
const getProductsByQuery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const q = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    // Count total matching products
    const totalItems = yield __1.prisma.product.count({
        where: {
            OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { brand: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
            ],
        },
    });
    // Fetch paginated products
    const products = yield __1.prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { brand: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
            ],
        },
        include: {
            category: true,
            images: true,
            variants: true,
        },
        skip: (page - 1) * limit,
        take: limit,
    });
    if (!products || products.length === 0) {
        throw new apiError_1.ApiError(404, "No products found");
    }
    const totalPages = Math.ceil(totalItems / limit);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {
        products,
        totalItems,
        totalPages,
    }, "Products found"));
});
exports.getProductsByQuery = getProductsByQuery;
const getProductsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.params;
    if (!name) {
        throw new apiError_1.ApiError(401, "Enter valid category Id");
    }
    const products = yield __1.prisma.product.findMany({
        where: {
            name,
        },
        include: {
            category: true,
            images: true,
            variants: true,
        },
    });
    if (!products || []) {
        throw new apiError_1.ApiError(404, "No products of this category found");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, products, "products found"));
});
exports.getProductsByCategory = getProductsByCategory;
