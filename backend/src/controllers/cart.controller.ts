import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { JwtPayload } from "jsonwebtoken";
import { AddToCartSchema } from "../schema/products";
import { ApiError } from "../utils/apiError";
import { prisma } from "..";

export const getCart = (req: Request, res: Response) => {};

export const addToCart: any = async (req: Request, res: Response) => {
  const userId = (req?.user as JwtPayload).id;

  const parsed = AddToCartSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.errors[0].message,
      parsed.error.errors.map((error) => error.path[0] + ": " + error.message)
    );
  }

  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: parsed.data.productId,
      variantId: parsed.data.variantId,
    },
  });

  if (existingItem) {
    const updatedItem = await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: existingItem.quantity + 1,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, updatedItem, "Item quantity updated"));
  } else {
    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: parsed.data.productId,
        variantId: parsed.data.variantId,
        quantity: parsed.data.quantity,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, newItem, "Item added to cart"));
  }

  return res.status(200).json(new ApiResponse(200, "Item added to cart"));
};
export const updateCartItem = (req: Request, res: Response) => {
  //  Update quantity/variant
};

export const removeItemFromCart = (req: Request, res: Response) => {};

export const clearCart = (req: Request, res: Response) => {};
