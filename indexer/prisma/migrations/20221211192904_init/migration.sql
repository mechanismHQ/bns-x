/*
  Warnings:

  - You are about to drop the column `accountId` on the `Name` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Name` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Name" DROP CONSTRAINT "Name_accountId_fkey";

-- AlterTable
ALTER TABLE "Name" DROP COLUMN "accountId",
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Name" ADD CONSTRAINT "Name_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
