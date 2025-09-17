/*
  Warnings:

  - You are about to drop the column `document_1` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `document_2` on the `Enrollment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Enrollment" DROP COLUMN "document_1",
DROP COLUMN "document_2";
