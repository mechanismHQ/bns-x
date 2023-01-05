/*
  Warnings:

  - A unique constraint covering the columns `[stacksApiId]` on the table `PrintEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PrintEvent_stacksApiId_key" ON "PrintEvent"("stacksApiId");
