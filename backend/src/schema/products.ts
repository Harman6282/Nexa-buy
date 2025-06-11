import { string, z } from "zod";

export const CreateProductSchema = z.object({
  name: string().min(1, "Product name is required"),
  description: string().min(1, "Product description is required"),
  price: z.coerce.number().min(1, "Product price is required").default(0),
  discount: z.coerce.number().default(0),
  brand: string().min(1, "Product brand is required"),
  categoryId: string().min(1, "Product category is required"),
  variants: z
    .array(
      z.object({
        size: z.string().min(1),
        color: z.string().min(1),
        stock: z.number().int().nonnegative(),
      })
    )
    .nonempty("At least one variant is required"),
});
