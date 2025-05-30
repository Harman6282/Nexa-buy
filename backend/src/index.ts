import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import rootRouter from "./routes";
import { PORT } from "./secrets";

const app = express();

app.use(express.json());

app.use("/api", rootRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 👍`);
});
