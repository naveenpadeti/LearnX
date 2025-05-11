/*
  Warnings:

  - Added the required column `category` to the `Club` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leader` to the `Club` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leaderTitle` to the `Club` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "established" TIMESTAMP(3),
ADD COLUMN     "leader" TEXT NOT NULL,
ADD COLUMN     "leaderContact" TEXT,
ADD COLUMN     "leaderImage" TEXT,
ADD COLUMN     "leaderTitle" TEXT NOT NULL,
ADD COLUMN     "meetingLocation" TEXT,
ADD COLUMN     "meetingSchedule" TEXT,
ADD COLUMN     "memberCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nextMeeting" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ClubEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,

    CONSTRAINT "ClubEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubDiscussion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "lastActive" TIMESTAMP(3) NOT NULL,
    "clubId" TEXT NOT NULL,

    CONSTRAINT "ClubDiscussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,

    CONSTRAINT "ClubResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "image" TEXT,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clubId" TEXT NOT NULL,

    CONSTRAINT "ClubMember_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClubEvent" ADD CONSTRAINT "ClubEvent_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubDiscussion" ADD CONSTRAINT "ClubDiscussion_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubResource" ADD CONSTRAINT "ClubResource_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
