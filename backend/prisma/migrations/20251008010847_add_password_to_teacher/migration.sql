/*
  Warnings:

  - A unique constraint covering the columns `[ci]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Made the column `last_name` on table `Teacher` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Teacher` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ci` on table `Teacher` required. This step will fail if there are existing NULL values in that column.
  - Made the column `placeofbirth` on table `Teacher` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Teacher" ADD COLUMN     "password" TEXT,
ALTER COLUMN "last_name" SET NOT NULL,
ALTER COLUMN "last_name" SET DATA TYPE TEXT,
ALTER COLUMN "second_last_name" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "ci" SET NOT NULL,
ALTER COLUMN "ci" SET DATA TYPE TEXT,
ALTER COLUMN "placeofbirth" SET NOT NULL,
ALTER COLUMN "placeofbirth" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_ci_key" ON "public"."Teacher"("ci");
