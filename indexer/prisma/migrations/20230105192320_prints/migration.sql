/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Name` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `Name` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(48)`.
  - You are about to alter the column `namespace` on the `Name` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - A unique constraint covering the columns `[name,namespace]` on the table `Name` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mintedAt` to the `Name` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Name" DROP CONSTRAINT "Name_ownerId_fkey";

-- AlterTable
ALTER TABLE "Name" DROP COLUMN "ownerId",
ADD COLUMN     "mintedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(48),
ALTER COLUMN "namespace" SET DATA TYPE VARCHAR(20);

-- CreateTable
CREATE TABLE "NameOwner" (
    "nftId" INTEGER NOT NULL,
    "ownerPrincipal" TEXT NOT NULL,

    CONSTRAINT "NameOwner_pkey" PRIMARY KEY ("nftId")
);

-- CreateTable
CREATE TABLE "PrintEvent" (
    "id" SERIAL NOT NULL,
    "stacksApiId" INTEGER NOT NULL,
    "contractId" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "hex" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "txid" TEXT NOT NULL,
    "eventIndex" INTEGER NOT NULL,
    "txIndex" INTEGER NOT NULL,
    "blockHeight" INTEGER NOT NULL,
    "indexBlockHash" TEXT NOT NULL,
    "microblockHash" TEXT NOT NULL,
    "microblockCanonical" BOOLEAN NOT NULL,
    "canonical" BOOLEAN NOT NULL,
    "microblockSequence" INTEGER NOT NULL,

    CONSTRAINT "PrintEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NameOwner_nftId_key" ON "NameOwner"("nftId");

-- CreateIndex
CREATE INDEX "PrintEvent_blockHeight_microblockSequence_txIndex_eventInde_idx" ON "PrintEvent"("blockHeight" DESC, "microblockSequence" DESC, "txIndex" DESC, "eventIndex" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Name_name_namespace_key" ON "Name"("name", "namespace");

-- AddForeignKey
ALTER TABLE "NameOwner" ADD CONSTRAINT "NameOwner_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "Name"("nftId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NameOwner" ADD CONSTRAINT "NameOwner_ownerPrincipal_fkey" FOREIGN KEY ("ownerPrincipal") REFERENCES "Account"("principal") ON DELETE RESTRICT ON UPDATE CASCADE;
