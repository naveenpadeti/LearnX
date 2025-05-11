import express from "express";
import {
    adminLoginController,
    createInstructorController, createMentorController,
    createStudentController, createStudents, instructorLoginController,
    loginController, mentorLoginController, updatePasswordController
} from "../controllers/authController";
import {instructorLogin} from "../services/authService";
import {authMiddleware} from "../middlewares/authMiddleware";
const authRoute = express.Router();

authRoute.post("/createStudent", createStudentController);
authRoute.post("/createInstructor", createInstructorController);
authRoute.post("/createMentor",createMentorController);
authRoute.post("/login", loginController);
authRoute.post("/admin/login",adminLoginController);
authRoute.post("/mentor/login",mentorLoginController);
authRoute.post("/instructor/login",instructorLoginController);
authRoute.post("/updatePassword",authMiddleware,updatePasswordController);
authRoute.post("/createStudentsBulk", createStudents);
export default authRoute;