-- CreateTable
CREATE TABLE "PrintEvent" (
    "stacksApiId" INTEGER NOT NULL,
    "contractId" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "hex" BYTEA NOT NULL,
    "topic" TEXT NOT NULL,
    "txid" BYTEA NOT NULL,
    "eventIndex" INTEGER NOT NULL,
    "txIndex" INTEGER NOT NULL,
    "blockHeight" INTEGER NOT NULL,
    "indexBlockHash" BYTEA NOT NULL,
    "microblockHash" BYTEA NOT NULL,
    "microblockCanonical" BOOLEAN NOT NULL,
    "canonical" BOOLEAN NOT NULL,
    "microblockSequence" INTEGER NOT NULL,

    CONSTRAINT "PrintEvent_pkey" PRIMARY KEY ("blockHeight","microblockSequence","txIndex","eventIndex")
);

-- CreateIndex
CREATE INDEX "PrintEvent_blockHeight_microblockSequence_txIndex_eventInde_idx" ON "PrintEvent"("blockHeight" DESC, "microblockSequence" DESC, "txIndex" DESC, "eventIndex" DESC);
