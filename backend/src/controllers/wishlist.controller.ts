import { Request, Response } from "express";
import { prisma } from "..";
import { ApiError } from "../utils/apiError";
import { JwtPayload } from "jsonwebtoken";
import { ApiResponse } from "../utils/apiResponse";

export const addToWishlist: any = async (req: Request, res: Response) => {
  const userId = (req?.user as JwtPayload)?.id;
  const { productId } = req.body;
  console.log("triggerd");

  if (!productId) {
    throw new ApiError(400, "Product Id is required");
  }

  const existingUsersProduct = await prisma.wishlist.findFirst({
    where: {
      productId,
      userId,
    },
  });

  if (existingUsersProduct) {
    throw new ApiError(409, "product already is in wishlist");
  }

  const product = await prisma.wishlist.create({
    data: {
      userId,
      productId,
    },
  });

  console.log("333333");

  if (!product) {
    throw new ApiError(500, "Error while adding to wishlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Added to wishlist"));
};

export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req?.user as JwtPayload)?.id;

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
    });

    if (!wishlist || wishlist.length === 0) {
      throw new ApiError(404, "Wishlist not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, wishlist, "Wishlist fetched successfully"));
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

  if (wishlist) {
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
