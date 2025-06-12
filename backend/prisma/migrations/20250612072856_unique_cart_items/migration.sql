/*
  Warnings:

  - A unique constraint covering the columns `[cartId,productId,variantId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_variantId_key" ON "CartItem"("cartId", "productId", "variantId");
