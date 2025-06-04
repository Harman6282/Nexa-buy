import { number, string, z } from "zod";


export const CreateProductSchema = z.object({
    name: string().min(3, "Product name is required"),
    description: string().min(3, "Product description is required"),
    price: number().default(0),
    discount: number().optional(),
    stock: number().default(0),
    


})