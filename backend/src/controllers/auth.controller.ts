import { Request, RequestHandler, Response } from "express";
import { LoginSchema, SignUpSchema } from "../schema/users";
import { prisma } from "..";
import bcryptjs from "bcryptjs";
import { generateToken } from "../utils/generateToken";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { JwtPayload } from "jsonwebtoken";
import { cache } from "../utils/cache";
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

  const newUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  generateToken(newUser, res);

  res.status(200).json(new ApiResponse(200, newUser, "Logged in"));
};

export const me = async (req: Request, res: Response) => {
  const userId = (req?.user as JwtPayload).id;
  let user;
  if (cache.has("logged_user")) {
    user = JSON.parse(cache.get("logged_user")!);
  } else {
    user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        imageUrl: true,
        address: true,
        _count: true,
        cart: true,
        createdAt: true,
        order: true,
        updatedAt: true,
      },
    });

    cache.set("logged_user", JSON.stringify(user));
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, " user fetched successfully"));
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  cache.del("logged_user");
  res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
};
