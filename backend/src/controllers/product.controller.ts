import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { CreateProductSchema } from "../schema/products";
import { ApiError } from "../utils/apiError";
import slugify from "slugify";
import { parse } from "path";
import { nanoid } from "nanoid";
import { prisma } from "..";
import { uploadOnCloudinary } from "../utils/cloudinary";

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

  // upload images
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }

  const uploadedImages: any = [];

  for (const file of files) {
    const result = await uploadOnCloudinary(file.path);

    uploadedImages.push({
      url: result.secure_url,
      publicId: result.public_id,
    });
  }

  // Map image data for Prisma

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
      images: {
        create: uploadedImages,
      },
    },
    include: {
      images: true,
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
};

export const deleteProduct: any = async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  if (!productId) {
    throw new ApiError(401, "Enter valid product Id");
  }

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
};

export const getProductById: any = async (req: Request, res: Response) => {
  console.log("getProductById called");
  const { id: productId } = req.params;
  if (!productId) {
    throw new ApiError(401, "Enter valid product Id");
  }

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
};

export const getAllProducts: any = async (req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: true,
    },
  });

  if (!products) {
    throw new ApiError(404, "Error fetching products");
  }

  return res.status(200).json(new ApiResponse(200, products, "products found"));
};

export const getProductsByQuery: any = async (req: Request, res: Response) => {
  const q = req.query.q as string;

  const products = await prisma.product.findMany({
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
    },
  });

  if (!products || products.length === 0) {
    throw new ApiError(404, "No products found");
  }

  return res.status(200).json(new ApiResponse(200, products, "products found"));
};
