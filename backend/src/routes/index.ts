import { Router } from "express";
import authRoutes from "./auth.route";
import productRoutes from "./product.route";
import cartRoutes from "./cart.routes";
import addressRoutes from "./address.route";
import orderRoutes from "./order.route";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/products", productRoutes);
rootRouter.use("/cart", cartRoutes);
rootRouter.use("/address", addressRoutes);
rootRouter.use("/orders", orderRoutes);

export default rootRouter;
