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

const app = express();

app.use(express.json());
app.use(cookieParser());

export const prisma = new PrismaClient({
  log: ["query"],
});

app.use("/api", rootRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 👍`);
});
