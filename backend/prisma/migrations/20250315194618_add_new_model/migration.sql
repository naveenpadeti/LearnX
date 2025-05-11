/*
  Warnings:

  - The primary key for the `Chapter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chapterId` on the `Chapter` table. All the data in the column will be lost.
  - You are about to drop the column `chapterOrder` on the `Chapter` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `flag` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `lectureDuration` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `acheivements` on the `User` table. All the data in the column will be lost.
  - The required column `id` was added to the `Chapter` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `order` to the `Chapter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Lecture` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `resourceType` on the `Lecture` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('VIDEO', 'ARTICLE', 'PDF', 'LINK');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'DROPPED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- DropForeignKey
ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_chapterId_fkey";

-- AlterTable
ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_pkey",
DROP COLUMN "chapterId",
DROP COLUMN "chapterOrder",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL,
ADD CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "completionDate" TIMESTAMP(3),
ADD COLUMN     "status" "EnrollmentStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "Lecture" DROP COLUMN "content",
DROP COLUMN "flag",
DROP COLUMN "lectureDuration",
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "resourceType",
ADD COLUMN     "resourceType" "ResourceType" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "acheivements",
ADD COLUMN     "achievements" TEXT[];

-- CreateTable
CREATE TABLE "CourseApproval" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "adminId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "remarks" TEXT,

    CONSTRAINT "CourseApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grade" DOUBLE PRECISION,
    "feedback" TEXT,
    "enrollmentId" INTEGER,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctAnswer" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseApproval_courseId_key" ON "CourseApproval"("courseId");

-- AddForeignKey
ALTER TABLE "CourseApproval" ADD CONSTRAINT "CourseApproval_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseApproval" ADD CONSTRAINT "CourseApproval_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
