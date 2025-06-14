import { Request, Response } from "express";
import { prisma } from "../..";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

export const updateOrderStatus: any = async (req: Request, res: Response) => {
  const { id: orderId } = req.params;
  const { status } = req.body;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
};
