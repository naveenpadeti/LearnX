-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('BUG', 'FEATURE', 'GENERAL');

-- CreateEnum
CREATE TYPE "FeedbackDomain" AS ENUM ('TEC', 'SIL', 'EDU');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'REVIEWED', 'IMPLEMENTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "domain" "FeedbackDomain" NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "contactEmail" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "pointsAwarded" BOOLEAN NOT NULL DEFAULT false,
    "pointsAmount" INTEGER,
    "implementationNotes" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
