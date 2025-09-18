import * as dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import rootRouter from "./routes";
import { PORT } from "./secrets";
import { PrismaClient } from "@prisma/client";
import errorHandler from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.set("trust proxy", 1);
import rateLimit from "express-rate-limit";

app.use(express.json());
app.use(cookieParser());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Request limit exceeded. Please try again later.",
});
app.use(limiter);

app.use(
  cors({
    origin: [process.env.FRONTEND_DOMAIN!],
    credentials: true,
  })
);

export const prisma = new PrismaClient();

app.use("/api", rootRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 👍`);
});
