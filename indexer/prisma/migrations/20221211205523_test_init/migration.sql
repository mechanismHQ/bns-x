/*
  Warnings:

  - Added the required column `zonefileHash` to the `Name` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_primaryNameId_fkey";

-- AlterTable
ALTER TABLE "Name" ADD COLUMN     "zonefileHash" TEXT NOT NULL,
ALTER COLUMN "zonefile" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Wrapper" (
    "id" SERIAL NOT NULL,
    "nameId" INTEGER NOT NULL,

    CONSTRAINT "Wrapper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wrapper_nameId_key" ON "Wrapper"("nameId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_primaryNameId_fkey" FOREIGN KEY ("primaryNameId") REFERENCES "Name"("nftId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wrapper" ADD CONSTRAINT "Wrapper_nameId_fkey" FOREIGN KEY ("nameId") REFERENCES "Name"("nftId") ON DELETE RESTRICT ON UPDATE CASCADE;
