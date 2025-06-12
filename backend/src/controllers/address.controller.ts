import { Request, Response } from "express";
import { CreateAddressSchema } from "../schema/users";
import { prisma } from "..";
import { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/apiError";

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

export const updateAddress: any = async (req: Request, res: Response) => {};

export const deleteAddress: any = async (req: Request, res: Response) => {};

export const getAllAddresses: any = async (req: Request, res: Response) => {};
