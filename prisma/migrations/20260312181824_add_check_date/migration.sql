/*
  Warnings:

  - A unique constraint covering the columns `[userId,checkDate]` on the table `DailyChecks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `checkDate` to the `DailyChecks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyChecks" ADD COLUMN     "checkDate" DATE NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DailyChecks_userId_checkDate_key" ON "DailyChecks"("userId", "checkDate");
