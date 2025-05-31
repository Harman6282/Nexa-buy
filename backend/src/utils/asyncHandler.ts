import { NextFunction, Request, Response } from "express";
import { RequestHandler } from "express-serve-static-core";

export const asyncHandler = (requestHandler : RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      next(err);
    });
  };
};
