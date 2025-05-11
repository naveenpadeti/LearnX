import prisma from "../config/dbConfig";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {Role} from "@prisma/client";
import {sendWelcomeEmail} from "../utils/mailer";
export async function createStudent(name: string, uniId: string, password: string) {
    try {
        const year = new Date().getFullYear();
        const yy = year.toString().slice(-2);
        const uniYear = uniId.slice(0, 2);
        const prefix = `${yy}VY${uniYear}`;
        const latestStudent = await prisma.user.findFirst({
            where: {
                id: {
                    startsWith: prefix
                },
                role: "STUDENT"
            },
            orderBy: {
                id: 'desc'
            }
        });

        let sequenceNumber = 1;

        if (latestStudent) {
            const lastSequence = parseInt(latestStudent.id.slice(-4));
            sequenceNumber = lastSequence + 1;
        }

        const formattedSequence = sequenceNumber.toString().padStart(4, '0');
        const id = `${prefix}${formattedSequence}`;

        if (id.length !== 10) {
            throw new Error(`Generated ID ${id} is not exactly 10 digits`);
        }

        const branchCode = uniId.charAt(5);
        let branch;

        switch (branchCode) {
            case '3':
                branch = 'CSE';
                break;
            case '4':
                branch = 'ECE';
                break;
            case '8':
                branch = 'AIDS';
                break;
            case '9':
                branch = 'CSIT';
                break;
            default:
                branch = 'Unknown';
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const email = `${uniId}@kluniversity.in`;

        const student = await prisma.user.create({
            data: {
                id,
                name,
                email,
                passwordHash,
                collegeID: uniId,
                role: "STUDENT",
                branch
            }
        });

        console.log(`Created student with ID: ${student.id}`);

        try {
            await sendWelcomeEmail({
                to: email,
                name,
                vyuha_id: id,
                password
            });
            console.log(`Welcome email sent to: ${email}`);
        } catch (emailError) {
            console.error("Email sending failed, but student was created:", emailError);
        }

        return "Student created successfully";
    } catch (error) {
        console.error("Error creating student:", error);
        throw error;
    }
}


export function generateToken(userId: string, role: string) {
    const payload = {
        id: userId,
        role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 ) * 3
    };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign(payload, secret);
}
export async function login(id: string, password: string) {
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });
    if (!user) {
        throw new Error("User not found");
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        throw new Error("Incorrect password");
    }
    const token = generateToken(user.id, user.role);
    return {token};
}

export async function verifyToken(token: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    const payload = jwt.verify(token, secret);
    return payload;
}
export async function adminLogin(email: string, password: string) {
    if(email !== process.env.EMAIL || password !== process.env.PASSWORD) {
        throw new Error("Invalid admin credentials");
    }
    const token = generateToken(email, "ADMIN");
    return {token};
}
export async function createInstructor(name:string, uniId:string, password:string) {
    try {
        const year = new Date().getFullYear();
        const yy = year.toString().slice(-2);
        const uniYear = uniId.slice(0, 2);
        const prefix = `${yy}VI${uniYear}`;
        const latestInstructor = await prisma.user.findFirst({
            where: { id: { startsWith: prefix }, role: "INSTRUCTOR" },
            orderBy: { id: 'desc' }
        });

        let sequenceNumber = latestInstructor ? parseInt(latestInstructor.id.slice(-4)) + 1 : 1;
        const id = `${prefix}${sequenceNumber.toString().padStart(4, '0')}`;

        if (id.length !== 10) throw new Error(`Generated ID ${id} is not exactly 10 digits`);

        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { id, name, email: `${uniId}@kluniversity.in`, passwordHash, collegeID: uniId, role: "INSTRUCTOR" }
        });
        return "Instructor created successfully";
    } catch (error) {
        console.error("Error creating instructor:", error);
        throw error;
    }
}

export async function createMentor(name:string, uniId:string, password:string) {
    try {
        const year = new Date().getFullYear();
        const yy = year.toString().slice(-2);
        const uniYear = uniId.slice(0, 2);
        const prefix = `${yy}VM${uniYear}`;
        const latestMentor = await prisma.user.findFirst({
            where: { id: { startsWith: prefix }, role: "MENTOR" },
            orderBy: { id: 'desc' }
        });

        let sequenceNumber = latestMentor ? parseInt(latestMentor.id.slice(-4)) + 1 : 1;
        const id = `${prefix}${sequenceNumber.toString().padStart(4, '0')}`;

        if (id.length !== 10) throw new Error(`Generated ID ${id} is not exactly 10 digits`);

        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { id, name, email: `${uniId}@kluniversity.in`, passwordHash, collegeID: uniId, role: "MENTOR" }
        });
        return "Mentor created successfully";
    } catch (error) {
        console.error("Error creating mentor:", error);
        throw error;
    }
}
export async function mentorLogin(id: string, password: string) {
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });
    if (!user) {
        throw new Error("User not found");
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        throw new Error("Incorrect password");
    }
    const token = generateToken(user.id, user.role);
    return {token};
}
export async function instructorLogin(id: string, password: string) {
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });
    if (!user) {
        throw new Error("User not found");
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        throw new Error("Incorrect password");
    }
    const token = generateToken(user.id, user.role);
    return {token};
}
export async function updatePassword(userId: string, oldPassword: string, newPassword: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error("User not found");
        }
        const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isValidPassword) {
            throw new Error("Current password is incorrect");
        }
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash }
        });

        return "Password updated successfully";
    } catch (error) {
        console.error("Error updating password:", error);
        throw error;
    }
}
export async function createStudentsBulk(students: { name: string; uniId: string; password: string }[]) {
    try {
        const year = new Date().getFullYear();
        const yy = year.toString().slice(-2);

        // Fetch existing students to track latest sequence per prefix
        const existingStudents = await prisma.user.findMany({
            where: { role: "STUDENT" },
            orderBy: { id: "desc" }
        });

        let latestSequenceMap: { [key: string]: number } = {};

        // Generate student data for bulk insert
        const studentDataPromises = students.map(async student => {
            const {name, uniId, password} = student;
            const uniYear = uniId.slice(0, 2);
            const prefix = `${yy}VY${uniYear}`;

            // Determine the next sequence number
            if (!latestSequenceMap[prefix]) {
                const latestStudent = existingStudents.find(s => s.id.startsWith(prefix));
                latestSequenceMap[prefix] = latestStudent
                    ? parseInt(latestStudent.id.slice(-4)) + 1
                    : 1;
            } else {
                latestSequenceMap[prefix] += 1;
            }

            const formattedSequence = latestSequenceMap[prefix].toString().padStart(4, '0');
            const id = `${prefix}${formattedSequence}`;

            if (id.length !== 10) {
                throw new Error(`Generated ID ${id} is not exactly 10 digits`);
            }

            // Extract branch from the 6th digit of uniId
            const branchCode = uniId.charAt(5);
            let branch = "Unknown";
            switch (branchCode) {
                case '3':
                    branch = 'CSE';
                    break;
                case '4':
                    branch = 'ECE';
                    break;
                case '8':
                    branch = 'AIDS';
                    break;
                case '9':
                    branch = 'CSIT';
                    break;
            }

            return {
                id,
                name,
                email: `${uniId}@kluniversity.in`,
                passwordHash: await bcrypt.hash(password, 10),
                collegeID: uniId,
                role: Role.STUDENT,
                branch
            };
        });

        const studentData = await Promise.all(studentDataPromises);

        await prisma.user.createMany({
            data: studentData,
            skipDuplicates: true
        });

        return { message: "Students created successfully", count: studentData.length };
    } catch (error) {
        console.error("Error creating students:", error);
        throw new Error("Error creating students");
    }
}