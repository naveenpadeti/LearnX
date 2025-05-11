import {NextFunction, Request, Response} from "express";
import {
    adminLogin,
    createInstructor,
    createMentor,
    createStudent, createStudentsBulk,
    instructorLogin,
    login,
    mentorLogin, updatePassword
} from "../services/authService";
export const createStudentController = (req: Request, res: Response) => {
    const {name, uniId, password} = req.body;
    createStudent(name, uniId, password).then((response) => {
        res.status(200).json(response);
    }).catch((error) => {
        res.status(400).json(error);
    });
}
export const loginController = (req: Request, res: Response) => {
    const {id, password} = req.body;
    login(id, password).then((response) => {
        res.status(200).json(response);
    }).catch((error) => {
        res.status(400).json(error);
    });
}
export const adminLoginController = async (req: Request, res: Response) => {
    const { id, password } = req.body;
    try {
        const response = await adminLogin(id, password);
        res.status(200).json(response);
    } catch (error:any) {
        res.status(400).json({ error: error.message });
    }
};
export const createInstructorController = (req: Request, res: Response) => {
    const {name, uniId, password} = req.body;
    createInstructor(name, uniId, password).then((response) => {
        res.status(200).json(response);
    }).catch((error) => {
        res.status(400).json(error);
    });
}
export const createMentorController = (req: Request, res: Response) => {
    const {name, uniId, password} = req.body;
    createMentor(name, uniId, password).then((response) => {
        res.status(200).json(response);
    }).catch((error) => {
        res.status(400).json(error);
    });
}
export const mentorLoginController = (req: Request, res: Response) => {
    const {id, password} = req.body;
    mentorLogin(id, password).then((response) => {
        res.status(200).json(response);
    }).catch((error) => {
        res.status(400).json(error);
    });
}
export const instructorLoginController = (req: Request, res: Response) => {
    const {id, password} = req.body;
    instructorLogin(id, password).then((response) => {
        res.status(200).json(response);
    }).catch((error) => {
        res.status(400).json(error);
    });
}
export const updatePasswordController = (req: Request, res: Response) => {
    const {userId, oldPassword, newPassword} = req.body;
    updatePassword(userId, oldPassword, newPassword).then((response) => {
        res.status(200).json(response);
    }).catch((error) => {
        res.status(400).json(error);
    });
}
export async function createStudents(req: Request, res: Response) {
    const students = req.body.students;
    createStudentsBulk(students).then((response) => {
        res.status(200).json(response);
    }).catch((error) => {
        res.status(400).json(error);
    });
}