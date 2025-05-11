import prisma from "../config/dbConfig";

export async function getInstructor(id: string) {
    return prisma.user.findUnique({
        where: {
            id
        }
    });
}