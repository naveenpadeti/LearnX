import prisma from "../config/dbConfig";
import supabase from "../config/supabase";
import {Prisma} from "@prisma/client";
const handleError = (operation: string, error: unknown) => {
    console.error(`Error in ${operation}:`, error);
    throw new Error(`Failed to ${operation}: ${error instanceof Error ? error.message : 'Unknown error'}`);
};
const ADMIN_EMAIL = "2300032870@kluniversity.in";
const ADMIN_USER = {
    id: "admin-id",
    name: "Admin User",
    email: ADMIN_EMAIL,
    role: "ADMIN",
    image: null,
    collegeID: "2300032870",
    branch: "CSE"
};

export async function getUser(id: string) {
    try {
        if (id === ADMIN_EMAIL) return ADMIN_USER;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                collegeID: true,
                branch: true
            }
        });

        return user || null;
    } catch (error) {
        handleError(`retrieve user ${id}`, error);
    }
}

export async function updateUserPhoto(id: string, photoBuffer: Buffer, mimetype: string) {
    try {
        if (!photoBuffer || photoBuffer.length === 0) {
            throw new Error("Invalid photo data");
        }

        const bucketName = process.env.SUPABASE_BUCKET_NAME || "vyuha-uploads";
        const fileExtension = mimetype.split("/")[1];
        const filePath = `public/${id}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, photoBuffer, {
                contentType: mimetype,
                cacheControl: "3600",
                upsert: true,
            });

        if (uploadError) {
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        if (!urlData) throw new Error("Failed to get public URL");

        const user = await prisma.user.update({
            where: { id },
            data: { image: urlData.publicUrl },
        });

        return user;
    } catch (error) {
        console.error("Error updating user photo:", error);
        throw error;
    }
}

export async function getUsers(page = 1, limit = 10, searchTerm = '') {
    try {
        const skip = (page - 1) * limit;
        const where = searchTerm ? {
            OR: [
                { name: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
                { email: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
                { id: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } }
            ]
        } : {};

        const [totalCount, users] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return {
            users,
            pagination: {
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
                page,
                limit
            }
        };
    } catch (error) {
        handleError("fetch users", error);
    }
}

export const checkEnrollment = async (userId: string, courseId: string) => {
    const enrollment = await prisma.enrollment.findFirst({
        where: { studentId: userId, courseId: courseId },
    });
    return !!enrollment;
};

export const allEnrollments = async (userId: string) => {
    return prisma.enrollment.findMany({
        where: {studentId: userId},
    });
}

export const setEnrollment = async (userId: string, courseId: string) => {
    return prisma.enrollment.create({
        data: {
            studentId: userId,
            courseId: courseId,
        },
    });
}

export const getChapters = async (courseId: string) => {
    return prisma.chapter.findMany({
        where: { courseId },
    });
}

export const getLectures = async (chapterId: string) => {
    return prisma.lecture.findMany({
        where: { chapterId },
    });
}

export const getCourses = async () => {
    return prisma.course.findMany({
        include: {
            courseContent: {
                orderBy: { order: 'asc' },
                include: {
                    lectures: {
                        orderBy: { order: 'asc' },
                    },
                },
            },
        },
    });
}

export async function submitAssignment(studentId: string, assignmentId: string, submissionUrl: string) {
    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            select: { courseId: true }
        });
        if (!assignment) {
            throw new Error(`Assignment with ID ${assignmentId} not found`);
        }
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                studentId,
                courseId: assignment.courseId
            }
        });

        if (!enrollment) {
            throw new Error(`Student ${studentId} is not enrolled in the course for this assignment`);
        }
        return prisma.$transaction(async (tx) => {
            const submission = await tx.submission.upsert({
                where: {
                    studentId_assignmentId: {
                        studentId,
                        assignmentId
                    }
                },
                update: {
                    submissionUrl,
                    submittedAt: new Date()
                },
                create: {
                    studentId,
                    assignmentId,
                    submissionUrl,
                    enrollmentId: enrollment.id
                }
            });

            return submission;
        });
    } catch (error) {
        console.error("Error submitting assignment:", error);
        throw new Error(`Failed to submit assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function submitFeedback(
    userId: string,
    data: {
        type: 'BUG' | 'FEATURE' | 'GENERAL',
        title: string,
        description: string,
        rating: number,
        domain: 'TEC' | 'SIL' | 'EDU',
        contactEmail?: string
    }
) {
    try {
        // Validate user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }

        // Create feedback entry
        const feedback = await prisma.feedback.create({
            data: {
                type: data.type as any, // Cast to Prisma enum
                title: data.title,
                description: data.description,
                rating: data.rating,
                domain: data.domain as any, // Cast to Prisma enum
                contactEmail: data.contactEmail,
                submittedBy: { connect: { id: userId } }
            }
        });

        return feedback;
    } catch (error) {
        handleError("submit feedback", error);
    }
}

export async function getFeedbackById(id: string) {
    try {
        return prisma.feedback.findUnique({
            where: { id },
            include: {
                submittedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });
    } catch (error) {
        handleError(`retrieve feedback ${id}`, error);
    }
}

export async function updateFeedbackStatus(
    id: string,
    status: 'PENDING' | 'REVIEWED' | 'IMPLEMENTED' | 'REJECTED',
    adminId: string,
    data?: {
        implementationNotes?: string,
        rejectionReason?: string,
        pointsAwarded?: boolean,
        pointsAmount?: number
    }
) {
    try {
        const updateData: any = {
            status,
            reviewedAt: new Date(),
            reviewedBy: adminId,
            ...data
        };

        // If feedback is implemented and points are awarded, update user's points
        if (status === 'IMPLEMENTED' && data?.pointsAwarded && data?.pointsAmount) {
            const feedback = await prisma.feedback.findUnique({
                where: { id },
                select: { userId: true }
            });

            if (feedback) {
                // Update in transaction to ensure both operations succeed
                return prisma.$transaction(async (tx) => {
                    // Update the feedback
                    const updatedFeedback = await tx.feedback.update({
                        where: { id },
                        data: updateData,
                    });

                    // Update the user's points (assuming there's a silPoints field)
                    await tx.user.update({
                        where: { id: feedback.userId },
                        data: {
                            silPoints: {
                                increment: data.pointsAmount
                            }
                        }
                    });

                    return updatedFeedback;
                });
            }
        }

        // If not awarding points, just update the feedback
        return prisma.feedback.update({
            where: { id },
            data: updateData
        });
    } catch (error) {
        handleError(`update feedback status ${id}`, error);
    }
}

export async function getAllFeedback(
    page = 1,
    limit = 10,
    status?: 'PENDING' | 'REVIEWED' | 'IMPLEMENTED' | 'REJECTED',
    domain?: 'TEC' | 'SIL' | 'EDU'
) {
    try {
        const skip = (page - 1) * limit;
        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (domain) {
            where.domain = domain;
        }

        const [totalCount, feedback] = await Promise.all([
            prisma.feedback.count({ where }),
            prisma.feedback.findMany({
                where,
                skip,
                take: limit,
                orderBy: { submittedAt: 'desc' },
                include: {
                    submittedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true
                        }
                    }
                }
            })
        ]);

        return {
            feedback,
            pagination: {
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
                page,
                limit
            }
        };
    } catch (error) {
        handleError("fetch feedback", error);
    }
}

export async function getUserFeedback(userId: string) {
    try {
        return prisma.feedback.findMany({
            where: { userId },
            orderBy: { submittedAt: 'desc' }
        });
    } catch (error) {
        handleError(`fetch user feedback for ${userId}`, error);
    }
}