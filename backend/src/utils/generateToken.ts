import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { Response } from "express";

export const generateToken: any = (user: any, res: Response) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET!,
    {
      expiresIn: "15d",
    }
  );

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: ".harmanxze.com",
    path: "/",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });
};

export const decodeJWT = (token: string) => {
  let decoded = jwt.decode(token);
  return decoded;
};
