import { Request, Response } from "express";
import { prisma } from "..";
import { ApiError } from "../utils/apiError";
import { JwtPayload } from "jsonwebtoken";
import { ApiResponse } from "../utils/apiResponse";

export const addToWishlist: any = async (req: Request, res: Response) => {
  const userId = (req?.user as JwtPayload)?.id;
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product Id is required");
  }

  // Check if product already in wishlist
  const existingItem = await prisma.wishlist.findFirst({
    where: {
      productId,
      userId,
    },
  });

  if (existingItem) {
    // If exists, remove it
    await prisma.wishlist.delete({
      where: {
        id: existingItem.id,
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Removed from wishlist"));
  }

  // If not exists, add it
  const newItem = await prisma.wishlist.create({
    data: {
      userId,
      productId,
    },
  });

  if (!newItem) {
    throw new ApiError(500, "Error while adding to wishlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newItem, "Added to wishlist"));
};

export const getWishlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req?.user as JwtPayload)?.id;

    console.log("first");

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            slug: true,
            images: {
              select: {
                url: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!wishlist || wishlist.length === 0) {
      throw new ApiError(404, "Wishlist not found");
    }
    const formattedWishlist = wishlist.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0]?.url || null,
      createdAt: item.createdAt,
    }));

    res
      .status(200)
      .json(
        new ApiResponse(200, formattedWishlist, "Wishlist fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong");
  }
};

export const deleteFromwishlist: any = async (req: Request, res: Response) => {
  const userId = (req?.user as JwtPayload)?.id;
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "wishlist product id is required");
  }

  const wishlist = await prisma.wishlist.delete({
    where: {
      id,
      userId,
    },
  });

  if (!wishlist) {
    throw new ApiError(404, "Error while deleting wishlist product ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, "wishlist fetched successfully"));
};

export const clearwishlist: any = async (req: Request, res: Response) => {
  const userId = (req?.user as JwtPayload)?.id;

  const wishlist = await prisma.wishlist.deleteMany({
    where: userId,
  });

  if (wishlist) {
    throw new ApiError(404, "wishlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "wishlist deleted successfully"));
};
