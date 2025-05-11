-- CreateTable
CREATE TABLE "_AssignedCourses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssignedCourses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AssignedCourses_B_index" ON "_AssignedCourses"("B");

-- AddForeignKey
ALTER TABLE "_AssignedCourses" ADD CONSTRAINT "_AssignedCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedCourses" ADD CONSTRAINT "_AssignedCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
