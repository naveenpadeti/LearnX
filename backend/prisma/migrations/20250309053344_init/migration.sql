/*
  Warnings:

  - Added the required column `type` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('IIE', 'TEC', 'ESO', 'LCH', 'HWB');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "type" "CourseType" NOT NULL;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
