import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/apiError";
import { prisma } from "..";
import { ApiResponse } from "../utils/apiResponse";
import { CreateOrderSchema } from "../schema/products";

export const createOrder: any = async (req: Request, res: Response) => {
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

  const total = cart.items.reduce((acc: any, item: any) => {
    return acc + item.quantity * item.product.price;
  }, 0);

  const newOrder = await prisma.order.create({
    data: {
      userId,
      address: `${address.lineOne}, ${address.lineTwo}, ${address.city}, ${address.state}, ${address.pincode}, ${address.country}`,
      items: {
        create: cart.items.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
      total: total,
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  await prisma.cartItem.deleteMany({
    where: { cartId },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newOrder, "Order created successfully"));
};

export const getAllOrders: any = async (req: Request, res: Response) => {
  const userId = (req?.user as JwtPayload)?.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          variant: true,
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!orders || orders.length === 0) {
    throw new ApiError(404, "No orders found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
};

export const getSingleOrder: any = async (req: Request, res: Response) => {
  const userId = (req?.user as JwtPayload)?.id;
  const orderId = req.params.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          variant: true,
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
};

export const cancelOrder: any = async (req: Request, res: Response) => {
  const userId = (req?.user as JwtPayload)?.id;
  const orderId = req.params.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId, userId },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status === "CANCELLED") {
    throw new ApiError(400, "Order is already cancelled");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, "Order cancelled successfully"));
};
