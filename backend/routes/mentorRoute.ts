import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {getUserController} from "../controllers/userController";
const mentorRoute = express.Router();
mentorRoute.get("/getMentor", authMiddleware, getUserController);
export default mentorRoute;