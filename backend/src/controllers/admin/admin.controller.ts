import { Request, Response } from "express";
import { prisma } from "../..";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { getAllOrders } from "../order.controller";
import { JwtPayload } from "jsonwebtoken";

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

export const updateCategory: any = (req: Request, res: Response) => {
  const { id: categoryId } = req.params;
  const { name } = req.body;
  if (!name) {
    throw new ApiError(400, "Category name is required");
  }
  const category = prisma.category.update({
    where: { id: categoryId },
    data: { name },
  });
  if (!category) {
    throw new ApiError(400, "Failed to update category");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"));
};

export const deleteCategory: any = (req: Request, res: Response) => {
  const { id: categoryId } = req.params;
  const { name } = req.body;
  if (!name) {
    throw new ApiError(400, "Category name is required");
  }
  const category = prisma.category.delete({
    where: { id: categoryId },
  });
  if (!category) {
    throw new ApiError(400, "Failed to delete category");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category deleted successfully"));
};

//? admin orders controllers

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

// export const updateVariantStock = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { id } = req.params;
//   const { stock } = req.body;

//   if (!id) {
//     throw new ApiError(401, "Enter valid product Id");
//   }
//   if (!stock) {
//     throw new ApiError(400, "Stock is required");
//   }

//   const updatedVariant = await prisma.productVariant.update({
//     where: { productId: id },
//     data: { stock },
//   });
//   if (!updatedVariant) {
//     throw new ApiError(400, "Failed to update stock");
//   }
//   return res
//     .status(200)
//     .json(new ApiResponse(200, updatedVariant, "Stock updated successfully"));
// };

export const getAllOrdersAdmin: any = async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
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
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const formatted = orders.map((o) => ({
    id: o.id,
    name: o?.user?.name,
    email: o?.user?.email,
    items: o?.items,
    total: o?.total,
    status: o?.status,
    createdAt: o?.createdAt,
  }));

  if (!orders || orders.length === 0) {
    throw new ApiError(404, "No orders found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, formatted, "Orders fetched successfully"));
};
