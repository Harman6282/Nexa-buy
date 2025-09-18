"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderSchema = exports.AddToCartSchema = exports.CreateProductSchema = void 0;
const zod_1 = require("zod");
exports.CreateProductSchema = zod_1.z.object({
    name: (0, zod_1.string)().min(1, "Product name is required"),
    description: (0, zod_1.string)().min(1, "Product description is required"),
    price: zod_1.z.coerce.number().min(1, "Product price is required").default(0),
    discount: zod_1.z.coerce.number().default(0),
    brand: (0, zod_1.string)().min(1, "Product brand is required"),
    categoryName: (0, zod_1.string)().min(1, "Product category is required"),
    imageUrls: zod_1.z
        .array((0, zod_1.string)())
        .nonempty("At least one image URL is required")
        .optional(),
    variants: zod_1.z
        .array(zod_1.z.object({
        size: zod_1.z.string().min(1),
        stock: zod_1.z.coerce.number().int().nonnegative(),
    }))
        .nonempty("At least one variant is required"),
});
exports.AddToCartSchema = zod_1.z.object({
    productId: (0, zod_1.string)().min(1, "Product ID is required"),
    variantId: (0, zod_1.string)().min(1, "Variant ID is required"),
    quantity: zod_1.z.coerce
        .number()
        .int()
        .min(1, "Quantity must be at least 1")
        .optional(),
});
exports.CreateOrderSchema = zod_1.z.object({
    cartId: (0, zod_1.string)().min(1, "Cart ID is required"),
    addressId: (0, zod_1.string)().min(1, "Address ID is required"),
});
