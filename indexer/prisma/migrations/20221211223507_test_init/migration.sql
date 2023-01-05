/*
  Warnings:

  - A unique constraint covering the columns `[principal]` on the table `Wrapper` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `principal` to the `Wrapper` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wrapper" ADD COLUMN     "principal" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Wrapper_principal_key" ON "Wrapper"("principal");
