-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "difficulty" "DifficultyLevel",
ADD COLUMN     "duration" TEXT;
