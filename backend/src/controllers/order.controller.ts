import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/apiError";
import { prisma } from "..";
import { ApiResponse } from "../utils/apiResponse";
import { CreateOrderSchema } from "../schema/products";

export const createOrder: any = async (req: Request, res: Response) => {
  console.log("triggerd");
  const userId = (req?.user as JwtPayload)?.id;
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.errors[0].message,
      parsed.error.errors
    );
  }

  const { cartId, addressId } = parsed.data;

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!cart || cart.userId !== userId || cart.items.length === 0) {
    throw new ApiError(404, "Invalid cart");
  }

  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address || address.userId !== userId) {
    throw new ApiError(404, "Invalid address");
  }

  const total = cart.items.reduce((acc, item) => {
    return acc + item.quantity * item.product.price;
  }, 0);

  const newOrder = await prisma.order.create({
    data: {
      userId,
      address: `${address.lineOne}, ${address.lineTwo}, ${address.city}, ${address.state}, ${address.pincode}, ${address.country}`,
      items: {
        create: cart.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
      total: total,
    },
    include: {
      items: true,
    },
  });

  await prisma.cartItem.deleteMany({
    where: { cartId },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newOrder, "Order created successfully"));
};

export const getAllOrders: any = async (req: Request, res: Response) => {};

export const getSingleOrder: any = async (req: Request, res: Response) => {};

export const cancelOrder: any = async (req: Request, res: Response) => {};
