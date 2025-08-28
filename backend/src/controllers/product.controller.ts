import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { CreateProductSchema } from "../schema/products";
import { ApiError } from "../utils/apiError";
import slugify from "slugify";
import { nanoid } from "nanoid";
import { prisma } from "..";
import { uploadOnCloudinary } from "../utils/cloudinary";

export const createProduct: any = async (req: Request, res: Response) => {
  console.log("createProduct called");
  if (typeof req.body.variants === "string") {
    try {
      req.body.variants = JSON.parse(req.body.variants);
    } catch (err) {
      throw new ApiError(400, "Invalid JSON format for 'variants'");
    }
  }

  const parsed = CreateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.errors[0].message,
      parsed.error.errors.map((error) => error.path[0] + ": " + error.message)
    );
  }

  const { name, description, price, brand, discount, categoryName, variants } =
    parsed.data;

  // upload images
  const files = req.files as Express.Multer.File[];

  // if (!files || files.length === 0) {
  //   throw new ApiError(400, "At least one product image is required");
  // }

  const uploadedImages: any = [];
  if (files) {
    for (const file of files) {
      const result = await uploadOnCloudinary(file.path);

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }
  }

  let finalImages = uploadedImages;

  // If no files uploaded, check for image URLs in req.body.imageUrls
  if ((!files || files.length === 0) && Array.isArray(req.body.imageUrls)) {
    finalImages = req.body.imageUrls
      .filter((url: string) => typeof url === "string" && url.trim() !== "")
      .map((url: string) => ({
        url,
        publicId: null,
      }));
  }

  // If still no images, throw error
  if (!finalImages || finalImages.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }

  const slug =
    slugify(name, { replacement: "-", lower: true }) + "-" + nanoid(8);
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      brand,
      discount,
      slug,
      categoryName,
      images: {
        create: finalImages,
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
export const collectionProducts: any = async (req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    include: {
      images: true,
    },
    take: 4,
  });

  if (!products || products.length === 0) {
    throw new ApiError(404, "No products found in this collection");
  }

  return res.status(200).json(new ApiResponse(200, products, "products found"));
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
      variants: true,
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return res.status(200).json(new ApiResponse(200, product, "product found"));
};

export const getAllProducts: any = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;

  const skip = (page - 1) * limit;

  if (isNaN(page) || isNaN(limit)) {
    throw new ApiError(400, "Invalid page or limit parameter");
  }
  if (page < 1 || limit < 1) {
    throw new ApiError(400, "Page and limit must be greater than 0");
  }
  if (limit > 100) {
    throw new ApiError(400, "Limit cannot exceed 100");
  }

  const products = await prisma.product.findMany({
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

  const totalProducts = await prisma.product.count();
  const totalPages = Math.ceil(totalProducts / limit);

  if (!products) {
    throw new ApiError(404, "Error fetching products");
  }

  if (products.length === 0) {
    throw new ApiError(404, "No products found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { products, totalPages }, "products found"));
};

export const getProductsByQuery: any = async (req: Request, res: Response) => {
  const q = req.query.q as string;

  const products = await prisma.product.findMany({
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
  });

  if (!products || products.length === 0) {
    throw new ApiError(404, "No products found");
  }

  return res.status(200).json(new ApiResponse(200, products, "products found"));
};

export const getProductsByCategory: any = async (
  req: Request,
  res: Response
) => {
  const { name } = req.params;

  if (!name) {
    throw new ApiError(401, "Enter valid category Id");
  }

  const products = await prisma.product.findMany({
    where: {
      name,
    },
    include: {
      category: true,
      images: true,
      variants: true,
    },
  });

  console.log(products);

  if (!products || []) {
    throw new ApiError(404, "No products of this category found");
  }
  return res.status(200).json(new ApiResponse(200, products, "products found"));
};
