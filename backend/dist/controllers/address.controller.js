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
exports.getAllAddresses = exports.deleteAddress = exports.updateAddress = exports.createAddress = void 0;
const users_1 = require("../schema/users");
const __1 = require("..");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
const createAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const parsed = users_1.CreateAddressSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new apiError_1.ApiError(400, parsed.error.errors[0].message, parsed.error.errors.map((error) => error.path[0] + ": " + error.message));
    }
    const { lineOne, lineTwo, city, pincode, country, state } = parsed.data;
    const address = yield __1.prisma.address.create({
        data: {
            lineOne: lineOne.trim(),
            lineTwo: lineTwo === null || lineTwo === void 0 ? void 0 : lineTwo.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            country: country.trim(),
            userId: userId.trim(),
        },
    });
    if (!address) {
        return res.status(500).json({
            error: "Failed to create address",
        });
    }
    return res.status(201).json({
        message: "Address created successfully",
        address,
    });
});
exports.createAddress = createAddress;
const updateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const addressId = req.params.id;
    const { lineOne, lineTwo, city, pincode, country, state } = req.body;
    const address = yield __1.prisma.address.findFirst({
        where: {
            id: addressId,
        },
    });
    if (!address) {
        throw new apiError_1.ApiError(404, "Address not found");
    }
    const updated = yield __1.prisma.address.update({
        where: {
            id: addressId,
        },
        data: {
            lineOne: lineOne || (address === null || address === void 0 ? void 0 : address.lineOne),
            lineTwo: lineTwo || (address === null || address === void 0 ? void 0 : address.lineTwo),
            city: city || (address === null || address === void 0 ? void 0 : address.city),
            state: state || (address === null || address === void 0 ? void 0 : address.state),
            pincode: pincode || (address === null || address === void 0 ? void 0 : address.pincode),
            country: country || (address === null || address === void 0 ? void 0 : address.country),
        },
    });
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, updated, "Address updated successfully"));
});
exports.updateAddress = updateAddress;
const deleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const addressId = req.params.id;
    const address = yield __1.prisma.address.delete({
        where: {
            id: addressId,
        },
    });
    if (!address) {
        throw new apiError_1.ApiError(404, "Address not found");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, null, "Address deleted successfully"));
});
exports.deleteAddress = deleteAddress;
const getAllAddresses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const addresses = yield __1.prisma.address.findMany({
        where: {
            userId,
        },
    });
    if (!addresses || addresses.length === 0) {
        throw new apiError_1.ApiError(404, "No addresses found for this user");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, addresses, "Addresses retrieved successfully"));
});
exports.getAllAddresses = getAllAddresses;
