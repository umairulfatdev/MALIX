/*
  Warnings:

  - You are about to drop the column `downloadEnabled` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `preferences` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Content" DROP COLUMN "downloadEnabled",
ADD COLUMN     "driveId" TEXT;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "preferences";

-- CreateTable
CREATE TABLE "Drive" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "driveType" TEXT NOT NULL DEFAULT 'google',
    "rootFolderId" TEXT,
    "totalSpace" DOUBLE PRECISION,
    "usedSpace" DOUBLE PRECISION DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Drive_isActive_idx" ON "Drive"("isActive");

-- CreateIndex
CREATE INDEX "Drive_driveType_idx" ON "Drive"("driveType");

-- CreateIndex
CREATE INDEX "Content_driveId_idx" ON "Content"("driveId");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "Drive"("id") ON DELETE SET NULL ON UPDATE CASCADE;
