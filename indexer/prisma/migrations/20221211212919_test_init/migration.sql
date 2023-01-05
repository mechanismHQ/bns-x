-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_primaryNameId_fkey";

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "primaryNameId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_primaryNameId_fkey" FOREIGN KEY ("primaryNameId") REFERENCES "Name"("nftId") ON DELETE SET NULL ON UPDATE CASCADE;
