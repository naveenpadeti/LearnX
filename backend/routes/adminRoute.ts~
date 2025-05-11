import express from "express";
import {getUserController, getUsersController} from "../controllers/userController";
import {authMiddleware} from "../middlewares/authMiddleware";
import {
    deleteCourseController,
    deleteUserController,
    getAllCoursesController,
    verifyCourseController
} from "../controllers/adminController";
import {
    createInstructorController,
    createMentorController,
    createStudentController
} from "../controllers/authController";
const adminRoute = express.Router();
adminRoute.get("/getUsers", getUsersController);
adminRoute.delete("/deleteUser",authMiddleware,deleteUserController);
adminRoute.delete("/deleteCourse",authMiddleware,deleteCourseController);
adminRoute.put("/verifyCourse",authMiddleware,verifyCourseController);
adminRoute.get("/getCourses",getAllCoursesController);
adminRoute.post("/addUser",authMiddleware,createStudentController);
adminRoute.post("/addInstructor",authMiddleware,createInstructorController);
adminRoute.post("/addMentor",authMiddleware,createMentorController);
export default adminRoute;