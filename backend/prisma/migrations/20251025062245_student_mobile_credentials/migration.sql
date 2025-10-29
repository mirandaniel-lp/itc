/*
  Warnings:

  - A unique constraint covering the columns `[app_username]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "app_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "app_password_hash" TEXT,
ADD COLUMN     "app_username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_app_username_key" ON "Student"("app_username");
