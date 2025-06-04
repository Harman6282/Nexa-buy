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
    slugify(name, { replacement: "-", lower: true }) + "-" + nanoid(8);
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

export const updateProduct: any = async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  if (!productId) {
    throw new ApiError(401, "Enter valid product Id");
  }
  try {
    const body = req.body;
    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ...body,
      },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, product, "product updated successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while updating product");
  }
};

export const deleteProduct: any = async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  if (!productId) {
    throw new ApiError(401, "Enter valid product Id");
  }
  try {
    const product = await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Product deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while deleting product");
  }
};

export const getProductById: any = async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  if (!productId) {
    throw new ApiError(401, "Enter valid product Id");
  }
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
      },
      include: {
        category: true,
        images: true,
      },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return res.status(200).json(new ApiResponse(200, product, "product found"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong on getProductById");
  }
};
