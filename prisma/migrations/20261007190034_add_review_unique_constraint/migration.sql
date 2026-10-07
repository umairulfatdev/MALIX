/*
  Warnings:

  - A unique constraint covering the columns `[userId,contentId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_contentId_key" ON "Review"("userId", "contentId");
