/*
  Warnings:

  - Added the required column `accountId` to the `Name` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Name` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namespace` to the `Name` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zonefile` to the `Name` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Name" ADD COLUMN     "accountId" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "namespace" TEXT NOT NULL,
ADD COLUMN     "zonefile" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "principal" TEXT NOT NULL,
    "primaryNameId" INTEGER NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_principal_key" ON "Account"("principal");

-- CreateIndex
CREATE UNIQUE INDEX "Account_primaryNameId_key" ON "Account"("primaryNameId");

-- AddForeignKey
ALTER TABLE "Name" ADD CONSTRAINT "Name_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_primaryNameId_fkey" FOREIGN KEY ("primaryNameId") REFERENCES "Name"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
