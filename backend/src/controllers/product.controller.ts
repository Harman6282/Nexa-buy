import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { CreateProductSchema } from "../schema/products";
import { ApiError } from "../utils/apiError";
import slugify from "slugify";
import { nanoid } from "nanoid";
import { prisma } from "..";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { JwtPayload } from "jsonwebtoken";
import { cache } from "../utils/cache";

export const createProduct: any = async (req: Request, res: Response) => {
  // Parse variants if sent as string
  if (typeof req.body.variants === "string") {
    try {
      req.body.variants = JSON.parse(req.body.variants);
    } catch (err) {
      throw new ApiError(400, "Invalid JSON format for 'variants'");
    }
  }

  // Validate input
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

  // Get uploaded files
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }

  // Upload each file to Cloudinary
  const uploadedImages: { url: string; publicId: string }[] = [];
  for (const file of files) {
    const result = await uploadOnCloudinary(file.path);

    uploadedImages.push({
      url: result.secure_url,
      publicId: result.public_id,
    });
  }

  // Create product with uploaded images
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
        create: uploadedImages,
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
    .json(new ApiResponse(200, product, "Product created successfully"));
};

export const updateProduct: any = async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  if (!productId) {
    throw new ApiError(401, "Enter valid product Id");
  }

  const { name, description, price, brand, discount, categoryName, variants } =
    req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update product
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          name,
          description,
          price,
          discount,
          brand,
          categoryName,
        },
      });

      if (!product) throw new ApiError(404, "Product not found");

      // 2. Get existing variants from DB
      const existingVariants = await tx.productVariant.findMany({
        where: { productId },
      });

      const incomingIds = variants
        .filter((v: any) => v.id)
        .map((v: any) => v.id);
      const existingIds = existingVariants.map((v) => v.id);

      // 3. Delete variants that are missing in the request
      const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
      if (toDelete.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      // 4. Upsert variants (update existing, create new)
      const updatedVariants = await Promise.all(
        variants.map((v: any) =>
          v.id
            ? tx.productVariant.update({
                where: { id: v.id },
                data: { size: v.size, stock: v.stock },
              })
            : tx.productVariant.create({
                data: { size: v.size, stock: v.stock, productId },
              })
        )
      );

      if (!updatedVariants) {
        throw new ApiError(
          404,
          "Failed to update variants while updating product"
        );
      }

      return { product, variants: updatedVariants };
    });

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Product updated successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Something went wrong while updating product");
  }
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
  let products;
  const cachekey = "collection_products";
  if (cache.has(cachekey)) {
    products = JSON.parse(cache.get(cachekey)!);
  } else {
    products = await prisma.product.findMany({
      include: {
        images: true,
      },
      take: 4,
    });
    cache.set(cachekey, JSON.stringify(products));
  }

  if (!products || products.length === 0) {
    throw new ApiError(404, "No products found in this collection");
  }

  return res.status(200).json(new ApiResponse(200, products, "products found"));
};
export const getProductById: any = async (req: Request, res: Response) => {
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
  const limit = parseInt(req.query.limit as string) || 10;
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

  const cacheKey = `products_page_${page}_limit_${limit}`;

  let products;
  let totalProducts;

  if (cache.has(cacheKey) && cache.has("totalProducts")) {
    products = JSON.parse(cache.get(cacheKey)!);
    totalProducts = JSON.parse(cache.get("totalProducts")!);
  } else {
    products = await prisma.product.findMany({
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

    totalProducts = await prisma.product.count();

    cache.set(cacheKey, JSON.stringify(products));
    cache.set("totalProducts", JSON.stringify(totalProducts));
  }

  const totalPages = Math.ceil(totalProducts / limit);

  if (!products) {
    throw new ApiError(404, "Error fetching products");
  }

  if (products.length === 0) {
    throw new ApiError(404, "No products found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { products, totalPages }, "Products found"));
};

export const getProductsByQuery: any = async (req: Request, res: Response) => {
  const q = (req.query.q as string) || "";
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.pageSize as string) || 10;

  // Count total matching products
  const totalItems = await prisma.product.count({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ],
    },
  });

  // Fetch paginated products
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
    skip: (page - 1) * limit,
    take: limit,
  });

  if (!products || products.length === 0) {
    throw new ApiError(404, "No products found");
  }

  const totalPages = Math.ceil(totalItems / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        totalItems,
        totalPages,
      },
      "Products found"
    )
  );
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

  if (!products || []) {
    throw new ApiError(404, "No products of this category found");
  }
  return res.status(200).json(new ApiResponse(200, products, "products found"));
};
