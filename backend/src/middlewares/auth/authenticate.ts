import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../../utils/apiError";
import { JWT_SECRET } from "../../secrets";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new ApiError(401, "Unauthorized", ["No token provided"]);
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized", ["Invalid token"]);
  }
};

export const adminCheck = (req: Request, res: Response, next: NextFunction) => {
  if ((req?.user as JwtPayload).role !== "ADMIN") {
    throw new ApiError(403, "Unauthorized", [
      "You are not authorized to access this resource",
    ]);
  }

  next();
};
