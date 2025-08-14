import { string, z } from "zod";

export const CreateProductSchema = z.object({
  name: string().min(1, "Product name is required"),
  description: string().min(1, "Product description is required"),
  price: z.coerce.number().min(1, "Product price is required").default(0),
  discount: z.coerce.number().default(0),
  brand: string().min(1, "Product brand is required"),
  categoryName: string().min(1, "Product category is required"),
  imageUrls: z.array(string()).nonempty("At least one image URL is required").optional(),
  variants: z
    .array(
      z.object({
        size: z.string().min(1),
        stock: z.number().int().nonnegative(),
      })
    )
    .nonempty("At least one variant is required"),
});

export const AddToCartSchema = z.object({
  productId: string().min(1, "Product ID is required"),
  variantId: string().min(1, "Variant ID is required"),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .optional(),
});

export const CreateOrderSchema = z.object({
  cartId: string().min(1, "Cart ID is required"),
  addressId: string().min(1, "Address ID is required"),
});
