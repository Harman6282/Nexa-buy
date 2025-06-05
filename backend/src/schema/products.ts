import { array, number, string, z } from "zod";


export const CreateProductSchema = z.object({
    name: string().min(1, "Product name is required"),
    description: string().min(1, "Product description is required"),
    price: z.coerce.number().min(1, "Product price is required").default(0),
    discount: z.coerce.number().default(0),
    stock: z.coerce.number().min(1, "Product stock is required").max(50, "Product stock cannot be more than 50").default(1),
    brand: string().min(1, "Product brand is required"),
    categoryId: string().min(1, "Product category is required"),
})