import prisma from "../config/dbConfig";
import { createClient } from "@supabase/supabase-js";
import {ResourceType} from "@prisma/client";

const supabase = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_ANON_KEY ?? '');
type CourseType = "IIE" | "TEC" | "ESO" | "LCH" | "HWB";
type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";

// Core interfaces
interface FileUploadResult {
    publicUrl: string;
}

interface SubmissionData {
    buffer: Buffer;
    mimetype: string;
}

// Helper function for file uploads to reduce code duplication
async function uploadFileToSupabase(
    bucketName: string,
    filePath: string,
    fileBuffer: Buffer,
    mimetype: string
): Promise<FileUploadResult> {
    try {
        if (fileBuffer.length > 50 * 1024 * 1024) {
            throw new Error("File size exceeds the maximum limit of 50MB");
        }
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, fileBuffer, {
                contentType: mimetype,
                cacheControl: "3600",
                upsert: true
            });

        if (uploadError) {
            console.error("Upload Error:", uploadError);
            throw new Error(`Failed to upload file: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        if (!urlData) throw new Error("Failed to get public URL");

        return { publicUrl: urlData.publicUrl };
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
}

async function generateCourseId(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const prefix = `VYCS`;
    const lastCourse = await prisma.course.findFirst({
        orderBy: { id: "desc" },
        select: { id: true }
    });

    let newNumber = 1;
    if (lastCourse && lastCourse.id.startsWith(`${year}${prefix}`)) {
        const lastNumber = parseInt(lastCourse.id.slice(-4));
        newNumber = lastNumber + 1;
    }

    const formattedNumber = String(newNumber).padStart(4, '0');
    return `${year}${prefix}${formattedNumber}`;
}

export async function createCourse(data: {
    title: string,
    description: string,
    image: Buffer,
    instructorId: string,
    mimetype: string,
    courseType: CourseType,
    duration: string,
    difficulty: DifficultyLevel,
}) {
    try {
        // Input validation
        if (!data.title || !data.description || !data.instructorId) {
            throw new Error("Missing required course data");
        }

        function isDifficultyLevel(value: any): value is DifficultyLevel {
            const difficultyLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"];
            return difficultyLevels.includes(value);
        }

        if (!isDifficultyLevel(data.difficulty)) {
            throw new Error(`Invalid difficulty level: ${data.difficulty}`);
        }

        const bucketName = process.env.SUPABASE_BUCKET_NAME || "vyuha-uploads";
        const fileExtension = data.mimetype.split("/")[1];
        const filePath = `course/${data.instructorId}/${Date.now()}-${data.title.replace(/\s+/g, '-')}.${fileExtension}`;

        const { publicUrl } = await uploadFileToSupabase(
            bucketName,
            filePath,
            data.image,
            data.mimetype
        );

        const courseId = await generateCourseId();

        // Use a transaction for data consistency
        const course = await prisma.$transaction(async (tx) => {
            return tx.course.create({
                data: {
                    id: courseId,
                    title: data.title,
                    description: data.description,
                    image: publicUrl,
                    instructorId: data.instructorId,
                    type: data.courseType,
                    duration: data.duration,
                    difficulty: data.difficulty
                },
            });
        });

        return course;
    } catch (error) {
        console.error("Error creating course:", error);
        throw new Error(`Course creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getInstructorCourses(
    id: string,
    page: number = 1,
    limit: number = 9
) {
    try {
        const skip = (page - 1) * limit;

        // Get total count
        const totalCount = await prisma.course.count({
            where: { instructorId: id }
        });

        // Get paginated data
        const courses = await prisma.course.findMany({
            where: { instructorId: id },
            select: {
                id: true,
                title: true,
                description: true,
                image: true,
                type: true,
                duration: true,
                difficulty: true,
                createdAt: true,
                isApproved: true,
                _count: {
                    select: {
                        enrollments: true,
                        courseContent: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        return {
            data: courses,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                pageSize: limit
            }
        };
    } catch (error) {
        console.error("Error fetching instructor courses:", error);
        throw new Error(`Failed to fetch instructor courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getCourse(id: string) {
    try {
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                courseContent: {
                    orderBy: { order: "asc" },
                    include: {
                        lectures: {
                            orderBy: { order: "asc" }
                        },
                    },
                },
            },
        });

        if (!course) {
            throw new Error(`Course with ID ${id} not found`);
        }

        return course;
    } catch (error) {
        console.error("Error fetching course:", error);
        throw new Error(`Failed to fetch course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function addChapter(courseId: string, title: string, chapterOrder: number) {
    try {
        if (!courseId || !title) {
            throw new Error("Course ID and title are required");
        }

        if (chapterOrder === undefined || isNaN(chapterOrder)) {
            throw new Error("Chapter order must be a valid number");
        }

        // Check if course exists
        const courseExists = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true }
        });

        if (!courseExists) {
            throw new Error(`Course with ID ${courseId} not found`);
        }

        const chapterId = `${courseId}-CH${String(chapterOrder).padStart(2, '0')}`;

        const chapter = await prisma.chapter.create({
            data: {
                id: chapterId,
                title,
                courseId,
                order: chapterOrder
            }
        });

        return chapter;
    } catch (error) {
        console.error("Error creating chapter:", error);
        throw new Error(`Chapter creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getChapters(courseId: string) {
    try {
        return await prisma.chapter.findMany({
            where: { courseId },
            include: {
                lectures: {
                    orderBy: { order: "asc" }
                }
            },
            orderBy: { order: "asc" }
        });
    } catch (error) {
        console.error("Error fetching chapters:", error);
        throw new Error(`Failed to fetch chapters: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function addLecture(data: {
    title: string;
    lectureDuration: number;
    chapterId: string;
    resourceType: string;
    resource?: Buffer;
    mimetype?: string;
    resourceUrl?: string;
    requiresSubmission: boolean
}) {
    try {
        // Input validation
        if (!data.title || !data.chapterId || !data.resourceType) {
            throw new Error("Missing required lecture data");
        }

        const chapter = await prisma.chapter.findUnique({
            where: { id: data.chapterId }
        });

        if (!chapter) {
            throw new Error(`Chapter with ID ${data.chapterId} not found`);
        }

        const existingLectures = await prisma.lecture.findMany({
            where: { chapterId: data.chapterId }
        });

        const order = existingLectures.length + 1;
        const lectureId = `${data.chapterId}-L${order}`;

        let resourceUrl = data.resourceUrl;

        if (!resourceUrl && data.resource && data.mimetype) {
            const bucketName = process.env.SUPABASE_BUCKET_NAME || "vyuha-uploads";
            const fileExtension = data.mimetype.split("/")[1];
            const filePath = `lecture/${data.chapterId}/${lectureId}.${fileExtension}`;

            // Use helper function for file upload
            const result = await uploadFileToSupabase(
                bucketName,
                filePath,
                data.resource,
                data.mimetype
            );

            resourceUrl = result.publicUrl;
        }

        const lecture = await prisma.lecture.create({
            data: {
                id: lectureId,
                title: data.title,
                duration: data.lectureDuration,
                order,
                chapterId: data.chapterId,
                resourceType: data.resourceType as ResourceType,
                resourceUrl,
                requiresSubmission: data.requiresSubmission || false
            }
        });

        return lecture;
    } catch (error) {
        console.error("Error creating lecture:", error);
        throw new Error(`Lecture creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getLectures(chapterId: string) {
    try {
        return await prisma.lecture.findMany({
            where: { chapterId },
            orderBy: { order: "asc" }
        });
    } catch (error) {
        console.error("Error fetching lectures:", error);
        throw new Error(`Failed to fetch lectures: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function setAssignment(data: {
    courseId: string;
    title: string;
    description: string;
    dueDate: Date;
    maxMarks: number;
}) {
    try {
        // Input validation
        if (!data.courseId || !data.title || !data.description || !data.dueDate) {
            throw new Error("Missing required assignment data");
        }

        // Check if course exists
        const courseExists = await prisma.course.findUnique({
            where: { id: data.courseId },
            select: { id: true }
        });

        if (!courseExists) {
            throw new Error(`Course with ID ${data.courseId} not found`);
        }

        const assignment = await prisma.assignment.create({
            data: {
                title: data.title,
                description: data.description,
                dueDate: data.dueDate,
                maxMarks: data.maxMarks || 100,
                courseId: data.courseId
            }
        });

        return assignment;
    } catch (error) {
        console.error("Error setting assignment:", error);
        throw new Error(`Failed to set assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function setSubmission(data: {
    studentId: string;
    assignmentId: string;
    submission: SubmissionData
}) {
    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: data.assignmentId },
            select: { id: true, courseId: true, dueDate: true }
        });

        if (!assignment) {
            throw new Error(`Assignment with ID ${data.assignmentId} not found`);
        }

        // Check if due date has passed
        if (new Date() > assignment.dueDate) {
            throw new Error("Submission deadline has passed");
        }

        // Upload the file
        const bucketName = process.env.SUPABASE_BUCKET_NAME || "vyuha-uploads";
        const fileExtension = data.submission.mimetype.split("/")[1];
        const filePath = `assignment/${data.studentId}/${data.assignmentId}-${Date.now()}.${fileExtension}`;

        const { publicUrl: fileUrl } = await uploadFileToSupabase(
            bucketName,
            filePath,
            data.submission.buffer,
            data.submission.mimetype
        );

        // Use upsert to handle resubmissions
        const submission = await prisma.submission.upsert({
            where: {
                studentId_assignmentId: {
                    studentId: data.studentId,
                    assignmentId: data.assignmentId
                }
            },
            update: {
                submissionUrl: fileUrl,
                submittedAt: new Date()
            },
            create: {
                studentId: data.studentId,
                assignmentId: data.assignmentId,
                submissionUrl: fileUrl,
                submittedAt: new Date()
            }
        });

        return submission;
    } catch (error) {
        console.error("Error setting submission:", error);
        throw new Error(`Failed to set submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getAssignments(courseId: string) {
    try {
        return await prisma.assignment.findMany({
            where: { courseId },
            orderBy: { dueDate: 'asc' }
        });
    } catch (error) {
        console.error("Error fetching assignments:", error);
        throw new Error(`Failed to fetch assignments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getStudentSubmissionsForCourse(studentId: string, courseId: string) {
    try {
        // More efficient query that uses a join
        return await prisma.submission.findMany({
            where: {
                studentId,
                assignment: {
                    courseId
                }
            },
            include: {
                assignment: {
                    select: {
                        id: true,
                        title: true,
                        dueDate: true
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching student submissions:", error);
        throw new Error(`Failed to fetch student submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getInstructorSubmissions(
    instructorId: string,
    page: number = 1,
    limit: number = 20
) {
    try {
        const skip = (page - 1) * limit;

        // Get total count for pagination metadata
        const totalCount = await prisma.submission.count({
            where: {
                assignment: {
                    course: {
                        instructorId
                    }
                }
            }
        });

        // Get paginated data
        const submissions = await prisma.submission.findMany({
            where: {
                assignment: {
                    course: {
                        instructorId
                    }
                }
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                assignment: {
                    select: {
                        id: true,
                        title: true,
                        dueDate: true,
                        courseId: true,
                        maxMarks: true,
                        course: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                submittedAt: 'desc'
            },
            skip,
            take: limit
        });

        return {
            data: submissions,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                pageSize: limit
            }
        };
    } catch (error) {
        console.error("Error fetching instructor submissions:", error);
        throw new Error(`Failed to fetch instructor submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function setGrade(data: {
    submissionId: string;
    marks: number;
    feedback: string
}) {
    try {
        if (!data.submissionId || data.marks === undefined) {
            throw new Error("Submission ID and marks are required");
        }

        const submission = await prisma.submission.findUnique({
            where: { id: data.submissionId }
        });

        if (!submission) {
            throw new Error(`Submission with ID ${data.submissionId} not found`);
        }

        return await prisma.submission.update({
            where: { id: data.submissionId },
            data: {
                grade: data.marks,
                feedback: data.feedback || ""
            }
        });
    } catch (error) {
        console.error("Error setting grade:", error);
        throw new Error(`Failed to set grade: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getAllStudentSubmissions(studentId: string) {
    try {
        return await prisma.submission.findMany({
            where: { studentId },
            include: {
                assignment: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        dueDate: true,
                        maxMarks: true,
                        courseId: true,
                        course: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });
    } catch (error) {
        console.error("Error fetching student submissions:", error);
        throw new Error(`Failed to fetch student submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function deleteCourse(courseId: string) {
    try {
        return await prisma.course.delete({
            where: { id: courseId }
        });
    } catch (error) {
        console.error("Error deleting course:", error);
        throw new Error(`Failed to delete course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}