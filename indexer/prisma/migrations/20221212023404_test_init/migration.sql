/*
  Warnings:

  - You are about to drop the column `zonefile` on the `Name` table. All the data in the column will be lost.
  - You are about to drop the column `zonefileHash` on the `Name` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Name" DROP COLUMN "zonefile",
DROP COLUMN "zonefileHash";
