import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { CreateProductSchema } from "../schema/products";
import { ApiError } from "../utils/apiError";
import slugify from "slugify";
import { parse } from "path";
import { nanoid } from "nanoid";
import { prisma } from "..";

export const createProduct: any = async (req: Request, res: Response) => {
  const parsed = CreateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.errors[0].message,
      parsed.error.errors.map((error) => error.path[0] + ": " + error.message)
    );
  }

  const { name, description, price, brand, discount, stock, categoryId } =
  parsed.data;
  
  const slug =
    slugify(name, { replacement: "-", lower: true }) +
    "-" +
    nanoid(8);
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      brand,
      discount,
      stock,
      slug,
      categoryId,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, product, "product created successfully"));
};

export const updateProduct = async (req: Request, res: Response) => {
  res.json("updated");
};

export const deleteProduct = async (req: Request, res: Response) => {
  res.json("deleted");
};

export const getProductById = async (req: Request, res: Response) => {
  res.json("fetched");
};
