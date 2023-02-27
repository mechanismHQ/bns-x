/*
  Warnings:

  - Added the required column `genesisHeight` to the `InscriptionZonefiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genesisTransaction` to the `InscriptionZonefiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outputValue` to the `InscriptionZonefiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestamp` to the `InscriptionZonefiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InscriptionZonefiles" ADD COLUMN     "genesisHeight" INTEGER NOT NULL,
ADD COLUMN     "genesisTransaction" TEXT NOT NULL,
ADD COLUMN     "outputValue" INTEGER NOT NULL,
ADD COLUMN     "timestamp" INTEGER NOT NULL;
