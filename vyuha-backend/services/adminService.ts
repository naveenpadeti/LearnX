import prisma from "../config/dbConfig";

export async function deleteUser(id: string) {
    return prisma.user.delete({
        where: {
            id
        }
    });
}
export async function verifyCourse(courseId: string) {
    try {
        return await prisma.course.update({
            where: {id: courseId},
            data: {isApproved: true}
        });
    } catch (error) {
        console.error("Error verifying course:", error);
        throw new Error("Course verification failed");
    }
}
export async function deleteCourse(courseId: string) {
    try {
        return prisma.course.delete({
            where: {id: courseId}
        })
    }catch (e) {
        console.error("Error deleting course:", e);
    }
}
export async function getAllCourses() {
    return prisma.course.findMany();
}