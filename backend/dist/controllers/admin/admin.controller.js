"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomersData = exports.updateStock = exports.getDashboard = exports.getAllOrdersAdmin = exports.updateOrderStatus = exports.deleteCategory = exports.updateCategory = exports.createCategory = void 0;
const __1 = require("../..");
const apiResponse_1 = require("../../utils/apiResponse");
const apiError_1 = require("../../utils/apiError");
const client_1 = require("@prisma/client");
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    if (!name) {
        throw new apiError_1.ApiError(400, "Category name is required");
    }
    const category = yield __1.prisma.category.create({
        data: { name },
    });
    if (!category) {
        throw new apiError_1.ApiError(400, "Failed to create category");
    }
    return res
        .status(201)
        .json(new apiResponse_1.ApiResponse(201, category, "Category created successfully"));
});
exports.createCategory = createCategory;
const updateCategory = (req, res) => {
    const { id: categoryId } = req.params;
    const { name } = req.body;
    if (!name) {
        throw new apiError_1.ApiError(400, "Category name is required");
    }
    const category = __1.prisma.category.update({
        where: { id: categoryId },
        data: { name },
    });
    if (!category) {
        throw new apiError_1.ApiError(400, "Failed to update category");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, category, "Category updated successfully"));
};
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => {
    const { id: categoryId } = req.params;
    const { name } = req.body;
    if (!name) {
        throw new apiError_1.ApiError(400, "Category name is required");
    }
    const category = __1.prisma.category.delete({
        where: { id: categoryId },
    });
    if (!category) {
        throw new apiError_1.ApiError(400, "Failed to delete category");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, category, "Category deleted successfully"));
};
exports.deleteCategory = deleteCategory;
//? admin orders controllers
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: orderId } = req.params;
    const { status } = req.body;
    console.log(status);
    if (!status) {
        throw new apiError_1.ApiError(400, "Status is required");
    }
    // ✅ validate against enum values
    const statusUpper = String(status).toUpperCase();
    if (!Object.values(client_1.OrderStatus).includes(statusUpper)) {
        throw new apiError_1.ApiError(400, "Invalid status");
    }
    const order = yield __1.prisma.order.update({
        where: { id: orderId },
        data: { status: { set: statusUpper } },
    });
    if (!order) {
        throw new apiError_1.ApiError(404, "Order not found");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, order, "Order status updated successfully"));
});
exports.updateOrderStatus = updateOrderStatus;
const getAllOrdersAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield __1.prisma.order.findMany({
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
    const formatted = orders.map((o) => {
        var _a, _b;
        return ({
            id: o.id,
            name: (_a = o === null || o === void 0 ? void 0 : o.user) === null || _a === void 0 ? void 0 : _a.name,
            email: (_b = o === null || o === void 0 ? void 0 : o.user) === null || _b === void 0 ? void 0 : _b.email,
            items: o === null || o === void 0 ? void 0 : o.items,
            total: o === null || o === void 0 ? void 0 : o.total,
            status: o === null || o === void 0 ? void 0 : o.status,
            createdAt: o === null || o === void 0 ? void 0 : o.createdAt,
        });
    });
    if (!orders || orders.length === 0) {
        throw new apiError_1.ApiError(404, "No orders found");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, formatted, "Orders fetched successfully"));
});
exports.getAllOrdersAdmin = getAllOrdersAdmin;
const getDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [totalOrders, totalSales, totalCustomers, totalProducts] = yield Promise.all([
        __1.prisma.order.count(),
        __1.prisma.order.aggregate({
            _sum: { total: true },
        }),
        __1.prisma.user.count(),
        __1.prisma.product.count(),
    ]);
    const formatted = {
        totalOrders: totalOrders || 0,
        totalSales: totalSales._sum.total || 0,
        totalCustomers: totalCustomers || 0,
        totalProducts: totalProducts || 0,
    };
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, formatted, "Dashboard fetched successfully"));
});
exports.getDashboard = getDashboard;
const updateStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { variantId, stock } = req.params;
    if (!variantId || isNaN(Number(stock))) {
        throw new apiError_1.ApiError(400, "Invalid variantId or stock value");
    }
    const updated = yield __1.prisma.productVariant.update({
        where: {
            id: variantId,
        },
        data: {
            stock: Number(stock),
        },
    });
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, updated, "Stock updated successfully"));
});
exports.updateStock = updateStock;
const getCustomersData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [stats, customers] = yield Promise.all([
            __1.prisma.order.aggregate({
                _sum: { total: true },
                _avg: { total: true },
            }),
            __1.prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    address: {
                        select: { city: true, country: true },
                        take: 1,
                    },
                    order: {
                        select: {
                            total: true,
                            createdAt: true,
                        },
                        orderBy: { createdAt: "desc" },
                    },
                    _count: { select: { order: true } },
                },
            }),
        ]);
        if (!stats || !customers) {
            throw new apiError_1.ApiError(500, "Error while fetching customers data");
        }
        // format customers
        const formattedCustomers = customers.map((u) => {
            var _a;
            return ({
                id: u.id,
                name: u.name,
                email: u.email,
                address: u.address[0] || "",
                ordersCount: u._count.order || 0,
                totalSpent: u.order.reduce((acc, curr) => acc + curr.total, 0) || 0,
                lastOrder: ((_a = u.order[0]) === null || _a === void 0 ? void 0 : _a.createdAt) || null,
            });
        });
        const response = {
            totalCustomers: customers.length,
            revenue: stats._sum.total || 0,
            avgOrderValue: stats._avg.total || 0,
            customers: formattedCustomers,
        };
        return res
            .status(200)
            .json(new apiResponse_1.ApiResponse(200, response, "Customers data fetched successfully"));
    }
    catch (error) {
        throw new apiError_1.ApiError(500, "Unexpected error while fetching customers data");
    }
});
exports.getCustomersData = getCustomersData;
