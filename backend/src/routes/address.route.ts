import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middlewares/auth/authenticate";
import {} from "../controllers/product.controller";
import { createAddress, deleteAddress, getAllAddresses, updateAddress } from "../controllers/address.controller";

const addressRoutes: Router = Router();

addressRoutes.post("/", [authenticate], asyncHandler(createAddress));
addressRoutes.put("/update/:id", [authenticate], asyncHandler(updateAddress));
addressRoutes.delete(
  "/delete/:id",
  [authenticate],
  asyncHandler(deleteAddress)
);
addressRoutes.get("/", [authenticate], asyncHandler(getAllAddresses));
export default addressRoutes;
