import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { JwtPayload } from "jsonwebtoken";
import { AddToCartSchema } from "../schema/products";
import { ApiError } from "../utils/apiError";
import { prisma } from "..";

export const getCart: any = async (req: Request, res: Response) => {
  const userId = (req?.user as JwtPayload).id;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart retrieved successfully"));
};

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

export const updateCartItem: any = async (req: Request, res: Response) => {
  //  Update quantity/variant
  const userId = (req.user as JwtPayload).id;
  const cartItemId = req.params.id;
  const { quantity, variantId } = req.body;

  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      id: cartItemId,
    },
  });

  if (!cartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  const updateItem = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: {
      quantity: quantity || cartItem.quantity,
      variantId: variantId || cartItem.variantId,
    },
  });

  return res.status(200).json(new ApiResponse(200, updateItem, "Item updated"));
};

export const removeItemFromCart: any = async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload).id;
  const cartItemId = req.params.id;

  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      id: cartItemId,
    },
  });

  if (!cartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  await prisma.cartItem.delete({
    where: {
      cartId: cart.id,
      id: cartItemId,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, cartItem, "Item removed from cart"));
};

export const clearCart: any = async (req: Request, res: Response) => {
  const userId = (req?.user as JwtPayload).id;

  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Cart cleared successfully"));
};
