import {Request,Response} from "express";
import {deleteCourse, deleteUser, getAllCourses, verifyCourse} from "../services/adminService";
export const deleteUserController = async (req: Request, res: Response) => {
    const {studentId} = req.body;
    try {
        await deleteUser(studentId);
        res.json({message: "User deleted successfully"});
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({error: "Error deleting user"});
    }
}
export const verifyCourseController = async (req: Request, res: Response) => {
    const {courseId} = req.body;
    try {
        await verifyCourse(courseId);
        res.json({message: "Course verified successfully"});
    } catch (error) {
        console.error("Error verifying course:", error);
        res.status(500).json({error: "Error verifying course"});
    }
}
export const deleteCourseController = async (req: Request, res: Response) => {
    const {courseId} = req.body;
    try {
        await deleteCourse(courseId);
        res.json({message: "Course deleted successfully"});
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({error: "Error deleting course"});
    }
}
export const getAllCoursesController = async (req: Request, res: Response) => {
    try {
        const courses = await getAllCourses();
        res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({error: "Error fetching courses"});
    }
}
