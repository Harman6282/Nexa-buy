import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { Response } from "express";

export const generateToken: any = (user: any, res: Response) => {
  const token = jwt.sign({ 
    id: user.id,
    email: user.email,
   }, JWT_SECRET!, {
    expiresIn: "15d",
  });

   res.cookie("accessToken", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
  });
};


export const decodeJWT = (token: string) => {
  let decoded = jwt.decode(token);
  return decoded;
}