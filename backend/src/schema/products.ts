import { number, string, z } from "zod";


export const CreateProductSchema = z.object({
    name: string().min(1, "Product name is required"),
    description: string().min(1, "Product description is required"),
    price: number().default(0),
    discount: number().optional(),
    stock: number().optional().default(0),
    brand: string().optional(),
    tags: string().optional(),
})