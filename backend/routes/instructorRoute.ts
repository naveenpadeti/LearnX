import express from "express";
import { getInstructorController } from "../controllers/instructorController";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
    addChapterController,
    addLectureController,
    createCourseController, deleteCourseController,
    getAssignmentsController,
    getChaptersController,
    getCourseController,
    getInstructorCoursesController,
    getInstructorSubmissionsController,
    getLecturesController,
    setAssignmentController,
    setGradeController
} from "../controllers/courseController";
import upload from "../config/multerConfig";
import {
    createQuiz,
    getQuiz,
    getStudentQuizAttempts,
    getPerformanceReport,
    getQuizzesByCourse,
    getAllQuizSubmissions,
    getQuizQuestions,
    updateQuizQuestion,
    deleteQuizQuestion,
    addQuizQuestion
} from "../controllers/quizController";
const instructorRoute = express.Router();
instructorRoute.get("/getInstructorProfile", authMiddleware, getInstructorController);
instructorRoute.post("/createCourse",authMiddleware,upload,createCourseController);
instructorRoute.get("/getInstructorCourses",authMiddleware, getInstructorCoursesController);
instructorRoute.get("/getCourse/:id",authMiddleware,getCourseController);
instructorRoute.post("/createChapter",authMiddleware,addChapterController);
instructorRoute.get("/getChapters",authMiddleware,getChaptersController);
instructorRoute.post("/addLecture",upload,authMiddleware,addLectureController);
instructorRoute.get("/getLectures",authMiddleware,getLecturesController);
instructorRoute.post("/setAssignment",authMiddleware,setAssignmentController);
instructorRoute.get("/getCourseAssignments/:id", authMiddleware, getAssignmentsController);
instructorRoute.get("/getInstructorSubmissions",authMiddleware,getInstructorSubmissionsController);
instructorRoute.put("/setGrade",authMiddleware,setGradeController);
instructorRoute.post("/createQuiz",authMiddleware, createQuiz);
instructorRoute.get("/quiz/:quizId", authMiddleware, getQuiz);
instructorRoute.get("/quizAttempts", authMiddleware, getStudentQuizAttempts);
instructorRoute.get("/performanceReport/:attemptId", authMiddleware, getPerformanceReport);
instructorRoute.get("/quiz/course/:courseId", authMiddleware, getQuizzesByCourse);
instructorRoute.get("/getAttempts",authMiddleware,getAllQuizSubmissions);
instructorRoute.delete("/deleteCourse/:courseId",authMiddleware,deleteCourseController);
instructorRoute.get("/quiz/:quizId/questions", authMiddleware, getQuizQuestions);
instructorRoute.put("/quiz/question/:questionId", authMiddleware, updateQuizQuestion);
instructorRoute.delete("/quiz/question/:questionId", authMiddleware, deleteQuizQuestion);
instructorRoute.post("/quiz/:quizId/questions", authMiddleware, addQuizQuestion);
export default instructorRoute;