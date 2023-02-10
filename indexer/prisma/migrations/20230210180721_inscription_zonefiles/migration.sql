-- CreateTable
CREATE TABLE "InscriptionZonefiles" (
    "inscriptionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "inscriptionContent" TEXT NOT NULL,
    "inscriptionContentType" TEXT NOT NULL,
    "stxAddress" TEXT,
    "btcAddress" TEXT,
    "inscriptionOwner" TEXT NOT NULL,
    "sat" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "zonefileRaw" TEXT NOT NULL,

    CONSTRAINT "InscriptionZonefiles_pkey" PRIMARY KEY ("inscriptionId")
);
