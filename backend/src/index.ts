import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import rootRouter from "./routes";
import { PORT } from "./secrets";
import { PrismaClient } from "@prisma/client";
import { log } from "console";

const app = express();

app.use(express.json());

export const prisma = PrismaClient({
  log: ["query"]
})

app.use("/api", rootRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 👍`);
});
