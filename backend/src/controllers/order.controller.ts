import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/apiError";
import { prisma } from "..";
import { ApiResponse } from "../utils/apiResponse";
import { CreateOrderSchema } from "../schema/products";
import razorpayInstance from "../utils/razorpay";
import crypto from "crypto";

export const verifyPayment: any = async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature !== expectedSign) {
    throw new ApiError(400, "Invalid payment signature");
  }

  // update order status
  const updatedOrder = await prisma.order.update({
    where: { razorpayOrderId: razorpay_order_id },
    data: {
      paymentStatus: "PAID",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    },
    include: { items: true },
  });

  return res.json(
    new ApiResponse(200, updatedOrder, "Payment verified successfully")
  );
};

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

  const options = {
    amount: total * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  //? create razorpay order here
  const razorpayOrder = await razorpayInstance.orders.create(options);

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
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "PENDING",
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

  return res.json(
    new ApiResponse(
      201,
      {
        order: newOrder,
        razorpayOrder,
        key: process.env.RAZORPAY_KEY_ID, // send to frontend
      },
      "Order created successfully"
    )
  );
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

export const getMyOrderItems: any = async (req: Request, res: Response) => {
  const userId = (req?.user as JwtPayload)?.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      address: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              images: {
                select: {
                  url: true,
                },
                take: 1,
              },
            },
          },
          variant: {
            select: {
              id: true,
              size: true,
              stock: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!orders || orders.length === 0) {
    throw new ApiError(404, "No orders found");
  }

  // Flatten all items into a single array with order info
  const myOrderItems = {
    items: orders.flatMap((order) =>
      order.items.map((item) => ({
        orderId: order.id,
        status: order.status,
        total: order.total,
        date: order.createdAt,
        address: order.address,
        itemId: item.id,
        quantity: item.quantity,
        price: item.price,
        productId: item.product.id,
        productName: item.product.name,
        image: item.product.images[0]?.url || null,
        variantId: item.variant.id,
        size: item.variant.size,
        stock: item.variant.stock,
        createdAt: order.createdAt,
      }))
    ),
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, myOrderItems, "Order items fetched successfully")
    );
};
