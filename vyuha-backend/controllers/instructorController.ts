import {getInstructor} from "../services/instructorService";
import {Request, Response} from "express";

export const getInstructorController = async (req: Request, res: Response) => {
    const { id } = req.body;
    try {
        const response = await getInstructor(id);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json(error);
    }
};