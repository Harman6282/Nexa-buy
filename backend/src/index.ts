import * as dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import rootRouter from "./routes";
import { PORT } from "./secrets";
import { PrismaClient } from "./generated/prisma/client";
import { log } from "console";
import { ApiError } from "./utils/apiError";

const app = express();

app.use(express.json());

export const prisma = new PrismaClient({
  log: ["query"],
});

//@ts-ignore
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   if (err instanceof ApiError) {
//     return res.status(err.statusCode || 500).json({
//       success: false,
//       message: err.message || "An unexpected error occurred",
//       errors: err.errors || [],
//       stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
//     });
//   }

//   // Fallback for unhandled errors
//   return res.status(500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//     errors: [],
//     stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
//   });
// });
app.use("/api", rootRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 👍`);
});
