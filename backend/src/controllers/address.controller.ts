import { Request, Response } from "express";
import { CreateAddressSchema } from "../schema/users";
import { prisma } from "..";
import { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

export const createAddress: any = async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload).id;

  const parsed = CreateAddressSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.errors[0].message,
      parsed.error.errors.map((error) => error.path[0] + ": " + error.message)
    );
  }
  const { lineOne, lineTwo, city, pincode, country, state } = parsed.data;

  const address = await prisma.address.create({
    data: {
      lineOne,
      lineTwo,
      city,
      state,
      pincode,
      country,
      userId,
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
};

export const updateAddress: any = async (req: Request, res: Response) => {
  const addressId = req.params.id;
  const { lineOne, lineTwo, city, pincode, country, state } = req.body;

  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
    },
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  const updated = await prisma.address.update({
    where: {
      id: addressId,
    },
    data: {
      lineOne: lineOne || address?.lineOne,
      lineTwo: lineTwo || address?.lineTwo,
      city: city || address?.city,
      state: state || address?.state,
      pincode: pincode || address?.pincode,
      country: country || address?.country,
    },
  });

    return res
        .status(200)
        .json(new ApiResponse(200,updated, "Address updated successfully"));

};

export const deleteAddress: any = async (req: Request, res: Response) => {
  const addressId = req.params.id;

  const address = await prisma.address.deleteMany({
    where: {
      id: addressId,
    },
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Address deleted successfully"));
};

export const getAllAddresses: any = async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload).id;

  const addresses = await prisma.address.findMany({
    where: {
      userId,
    },
  });

  if (!addresses || addresses.length === 0) {
    throw new ApiError(404, "No addresses found for this user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, addresses, "Addresses retrieved successfully"));
};
