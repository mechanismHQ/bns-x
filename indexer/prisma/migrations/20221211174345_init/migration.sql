-- CreateTable
CREATE TABLE "Name" (
    "id" SERIAL NOT NULL,
    "nftId" INTEGER NOT NULL,

    CONSTRAINT "Name_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Name_nftId_key" ON "Name"("nftId");
