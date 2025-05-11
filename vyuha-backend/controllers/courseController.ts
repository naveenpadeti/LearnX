import { ResourceType } from "@prisma/client";
import {
    addChapter,
    addLecture,
    createCourse, getAllStudentSubmissions,
    getAssignments,
    getChapters,
    getCourse,
    getInstructorCourses,
    getInstructorSubmissions,
    getLectures,
    getStudentSubmissionsForCourse,
    setAssignment, setGrade,
    setSubmission
} from "../services/courseService";
import { Request, Response } from "express";
import {deleteCourse} from "../services/adminService";
export const createCourseController = async (req: Request, res: Response): Promise<void> => {
    const { title, description, id, courseType, duration, difficulty } = req.body;
    const image = req.file?.buffer;
    const mimetype = req.file?.mimetype;
    const instructorId = id;

    if (!image || !mimetype) {
        res.status(400).json({ error: "No image uploaded or invalid file type" });
        return;
    }

    try {
        const response = await createCourse({
            title,
            description,
            image,
            instructorId,
            mimetype,
            courseType,
            duration,
            difficulty
        });
        res.status(200).json(response);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const getInstructorCoursesController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.body;
    try {
        const response = await getInstructorCourses(id);
        res.status(200).json(response);
    } catch (error:any) {
        res.status(400).json({ error: error.message });
    }
}
export const getCourseController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const response = await getCourse(id);
        res.status(200).json(response);
    } catch (error:any) {
        res.status(400).json({ error: error.message });
    }
}
export const addChapterController = async (req: Request, res: Response): Promise<void> => {
    const {courseId, title, chapterOrder} = req.body;
    try {
        const response = await addChapter(courseId, title, chapterOrder);
        res.status(200).json(response);
    } catch (error:any) {
        res.status(400).json({ error: error.message });
    }
}
export const getChaptersController = async (req: Request, res: Response): Promise<void> => {
    const { courseId } = req.body;
    try {
        const response = await getChapters(courseId);
        res.status(200).json(response);
    } catch (error:any) {
        res.status(400).json({ error: error.message });
    }
}
export const addLectureController = async (req: Request, res: Response): Promise<void> => {
    console.log("📥 Request Received:");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { title, lectureDuration, order, chapterId, resourceType, resourceUrl, requiresSubmission } = req.body;
    const resource = req.file?.buffer;
    const mimetype = req.file?.mimetype;

    if (!title || !lectureDuration || !chapterId || !resourceType) {
        console.log("❌ Missing required fields");
        res.status(400).json({ error: "Missing required fields" });
        return;
    }

    try {
        // Use exact enum values expected by Prisma schema
        // These values need to match your Prisma schema definition exactly
        const normalizeResourceType = (type: string): ResourceType => {
            switch(type.toUpperCase()) {
                case 'LINK': return ResourceType.LINK;
                case 'VIDEO': return ResourceType.VIDEO;
                case 'PDF': return ResourceType.PDF;
                case 'ARTICLE': return ResourceType.ARTICLE;
                case 'DOCUMENT': return ResourceType.PDF; // Map DOCUMENT to PDF
                default: return ResourceType.LINK;
            }
        };

        const response = await addLecture({
            title,
            lectureDuration: parseInt(lectureDuration, 10),
            chapterId,
            resourceType: normalizeResourceType(resourceType),
            resource,
            mimetype,
            resourceUrl,
            requiresSubmission: requiresSubmission === 'true'
        });
        res.status(201).json(response);
    } catch (error: any) {
        console.error("❌ Error in addLectureController:", error.message);
        res.status(500).json({ error: error.message });
    }
};
export const getLecturesController = async (req: Request, res: Response): Promise<void> => {
    const { chapterId } = req.body;
    try {
        const response = await getLectures(chapterId);
        res.status(200).json(response);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const setAssignmentController = async (req: Request, res: Response): Promise<void> => {
    const { courseId, title, description, dueDate, maxMarks } = req.body;
    try {
        const response = await setAssignment({ courseId, title, description, dueDate, maxMarks });
        res.status(200).json(response);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const setSubmissionController = async (req: Request, res: Response): Promise<void> => {
    const { assignmentId, studentId } = req.body;
    const buffer = req.file?.buffer;
    const mimetype = req.file?.mimetype;

    if (!buffer || !mimetype) {
        res.status(400).json({ error: "No file uploaded or invalid file type" });
        return;
    }

    try {
        const response = await setSubmission({
            assignmentId,
            studentId,
            submission: {
                buffer,
                mimetype
            }
        });
        res.status(200).json(response);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const getAssignmentsController = async (req: Request, res: Response): Promise<void> => {
    const { id: courseId } = req.params;
    try {
        const response = await getAssignments(courseId);
        res.status(200).json(response);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}


export const getInstructorSubmissionsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.body.id;
        if (!id) {
            res.status(400).json({ error: "instructorId is required" });
            return;
        }
        const assignments = await getInstructorSubmissions(id);
        res.status(200).json(assignments);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const setGradeController = async (req: Request, res: Response): Promise<void> => {
    const { submissionId, marks, feedback } = req.body;
    try {
        const response = await setGrade({submissionId, marks, feedback});
        res.status(200).json(response);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const getSubmissionsController = async (req: Request, res: Response): Promise<void> => {
    const studentId = req.body.id;
    try {
        const submissions = await getAllStudentSubmissions(studentId);
        res.status(200).json(submissions);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
export const deleteCourseController = async (req: Request, res: Response): Promise<void> => {
    const { courseId } = req.params;
    try {
        const response = await deleteCourse(courseId);
        res.status(200).json(response);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}