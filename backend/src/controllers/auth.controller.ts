import { Request, RequestHandler, Response } from "express";
import { LoginSchema, SignUpSchema } from "../schema/users";
import { prisma } from "..";
import bcryptjs from "bcryptjs";
import { generateToken } from "../utils/generateToken";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { JwtPayload } from "jsonwebtoken";
export const signup: any = async (req: Request, res: Response) => {
  const parsed = SignUpSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(
      400,
      "Invalid request body",
      parsed.error.errors.map((error) => error.path[0] + ": " + error.message)
    );
  }
  const body = parsed.data;

  const existinguser = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (existinguser) {
    throw new ApiError(409, "User already exists", [
      "User with this email already exists",
    ]);
  }

  const hashedPassword = bcryptjs.hashSync(body.password, 10);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashedPassword,
    },
  });

  if (user) {
    generateToken(user, res);
  }

  res.status(200).json(new ApiResponse(200, user, "Sign up successful"));
};

export const login: any = async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(
      400,
      "Invalid request body",
      parsed.error.errors.map((error) => error.message)
    );
  }
  const body = parsed.data;

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found", [
      "User with this email does not exist",
    ]);
  }

  const isPasswordValid = bcryptjs.compareSync(body.password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password");
  }

  generateToken(user, res);

  res.status(200).json(new ApiResponse(200, user, "Logged in"));
};

export const me = async (req: Request, res: Response) => {
  const userId = (req?.user as JwtPayload).id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  res
    .status(200)
    .json(new ApiResponse(200, user, " user fetched successfully"));
};
export const adminTest = (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(200, {}, "admin Test successful"));
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
};
