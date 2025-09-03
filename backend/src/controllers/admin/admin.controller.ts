import { Request, Response } from "express";
import { prisma } from "../..";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { getAllOrders } from "../order.controller";
import { JwtPayload } from "jsonwebtoken";
import { OrderStatus } from "@prisma/client";

 

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
  const { id: orderId } = req.params;
  const { status } = req.body;
  console.log(status);

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  // ✅ validate against enum values
  const statusUpper = String(status).toUpperCase() as OrderStatus;
  if (!Object.values(OrderStatus).includes(statusUpper)) {
    throw new ApiError(400, "Invalid status");
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: { set: statusUpper } },
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

export const getDashboard: any = async (req: Request, res: Response) => {
  const [totalOrders, totalSales, totalCustomers, totalProducts] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.user.count(),
      prisma.product.count(),
    ]);

  const formatted = {
    totalOrders: totalOrders || 0,
    totalSales: totalSales._sum.total || 0,
    totalCustomers: totalCustomers || 0,
    totalProducts: totalProducts || 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, formatted, "Dashboard fetched successfully"));
};

export const updateStock: any = async (req: Request, res: Response) => {
  const { variantId, stock } = req.params;

  if (!variantId || isNaN(Number(stock))) {
    throw new ApiError(400, "Invalid variantId or stock value");
  }

  const updated = await prisma.productVariant.update({
    where: {
      id: variantId,
    },
    data: {
      stock: Number(stock),
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Stock updated successfully"));
};
