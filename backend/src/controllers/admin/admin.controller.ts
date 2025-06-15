import { Request, Response } from "express";
import { prisma } from "../..";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

export const updateOrderStatus: any = async (req: Request, res: Response) => {
  console.log("first");
  const { id: orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

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

export const createCategory: any = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    throw new ApiError(400, "Category name is required");
  }
  const category = await prisma.category.create({
    data: { name },
  });
  if (!category) {
    throw new ApiError(400, "Failed to create category");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully"));
};
