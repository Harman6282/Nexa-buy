import { Router } from "express";
import authRoutes from "./auth.route";
import productRoutes from "./product.route";


const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/products", productRoutes)

export default rootRouter;