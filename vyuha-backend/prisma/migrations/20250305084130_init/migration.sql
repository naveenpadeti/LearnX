/*
  Warnings:

  - Added the required column `resourceType` to the `Lecture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lecture" ADD COLUMN     "resourceType" TEXT NOT NULL,
ADD COLUMN     "resourceUrl" TEXT;
