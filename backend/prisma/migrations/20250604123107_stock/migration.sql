/*
  Warnings:

  - You are about to drop the column `Stock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "Stock",
DROP COLUMN "tags",
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "imageUrl" TEXT;
