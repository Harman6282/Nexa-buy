import * as dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import rootRouter from "./routes";
import { PORT } from "./secrets";
import { PrismaClient } from "./generated/prisma/client";
import { log } from "console";
import { ApiError } from "./utils/apiError";
import errorHandler from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";
import multer from "multer";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  (
    err: Error | multer.MulterError,
    req: Request,
    res: Response,
    next: NextFunction
  ): any => {
    if (
      err instanceof multer.MulterError ||
      err.message.includes("Unsupported file type")
    ) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
);

export const prisma = new PrismaClient({
  log: ["query"],
});

app.use("/api", rootRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 👍`);
});
