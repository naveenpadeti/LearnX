import {
    allEnrollments,
    checkEnrollment, getChapters, getLectures,
    getUser,
    getUsers,
    setEnrollment,
    updateUserPhoto, getCourses, submitAssignment,submitFeedback,
    getFeedbackById,
    updateFeedbackStatus,
    getAllFeedback,
    getUserFeedback
} from "../services/userService";
import { Request, Response } from "express";

export const getUserController = (req: Request, res: Response) => {
    const { id } = req.body;
    getUser(id).then((response) => {
        res.status(200).json(response);
    }).catch((error) => {
        res.status(400).json(error);
    });
};

export const updateUserPhotoController = async (req: Request, res: Response) => {
    const { id } = req.body;
    const photoBuffer = req.file?.buffer;
    const mimetype = req.file?.mimetype; // Get file type

    if (!photoBuffer || !mimetype) {
        return res.status(400).json({ error: "No photo uploaded or invalid file type" });
    }

    try {
        const response = await updateUserPhoto(id, photoBuffer, mimetype);
        res.status(200).json(response);
    } catch (error) {
        console.error("Error in updateUserPhotoController:", error);
        res.status(500).json({ error: "Failed to update photo" });
    }
};
export const getUsersController = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const searchTerm = req.query.search as string || '';

        const response = await getUsers(page, limit, searchTerm);
        res.status(200).json(response);
    } catch (error) {
        console.error("Error in getUsersController:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
}
export const getCoursesController = async (req: Request, res: Response) => {
    try {
        const response = await getCourses();
        res.status(200).json(response);
    }catch (e) {
        console.error("Failed to fetch courses:", e);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
}



export const getEnrollementStatus = async (req: Request, res: Response) => {
    const { userId, courseId } = req.body;
    try {
        const response = await checkEnrollment(userId, courseId);
        res.status(200).json(response);
    } catch (error) {
        console.error("Error in getEnrollementStatus:", error);
        res.status(500).json({ error: "Failed to check enrollment status" });
    }
}
export const getAllEnrollments = async (req: Request, res: Response) => {
    const { userId } = req.body;
    try {
        const response = await allEnrollments(userId);
        res.status(200).json(response);
    } catch (error) {
        console.error("Error in getAllEnrollments:", error);
        res.status(500).json({ error: "Failed to fetch enrollments" });
    }
}
export const setEnrollmentController = async (req: Request, res: Response) => {
    const { id, courseId } = req.body;
    try {
        const response = await setEnrollment(id, courseId);
        res.status(200).json(response);
    } catch (error) {
        console.error("Error in setEnrollmentController:", error);
        res.status(500).json({ error: "Failed to set enrollment" });
    }
}
export const getChapterController = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    try {
        const response = await getChapters(courseId);
        res.status(200).json(response);
    } catch (error) {
        console.error("Error in getChapterController:", error);
        res.status(500).json({ error: "Failed to fetch chapters" });
    }
}
export const getLectureController = async (req: Request, res: Response) => {
    const { chapterId } = req.params;
    try {
        const response = await getLectures(chapterId);
        res.status(200).json(response);
    } catch (error) {
        console.error("Error in getLectureController:", error);
        res.status(500).json({ error: "Failed to fetch lectures" });
    }
}


export const submitFeedbackController = async (req: Request, res: Response) => {
    try {
        const { userId, type, title, description, rating, domain, contactEmail } = req.body;

        if (!userId || !type || !title || !description || rating === undefined || !domain) {
            res.status(400).json({ error: "Missing required fields" });
            return; // Return void, not the response object
        }

        const feedback = await submitFeedback(userId, {
            type,
            title,
            description,
            rating,
            domain,
            contactEmail
        });

        res.status(200).json(feedback);
    } catch (error) {
        console.error("Error in submitFeedbackController:", error);
        res.status(500).json({ error: "Failed to submit feedback" });
    }
};

export const getFeedbackByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const feedback = await getFeedbackById(id);

        if (!feedback) {
            res.status(404).json({ error: "Feedback not found" });
            return;
        }

        res.status(200).json(feedback);
    } catch (error) {
        console.error("Error in getFeedbackByIdController:", error);
        res.status(500).json({ error: "Failed to retrieve feedback" });
    }
};

export const updateFeedbackStatusController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, adminId, implementationNotes, rejectionReason, pointsAwarded, pointsAmount } = req.body;

        if (!id || !status || !adminId) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const updatedFeedback = await updateFeedbackStatus(id, status, adminId, {
            implementationNotes,
            rejectionReason,
            pointsAwarded,
            pointsAmount
        });

        res.status(200).json(updatedFeedback);
    } catch (error) {
        console.error("Error in updateFeedbackStatusController:", error);
        res.status(500).json({ error: "Failed to update feedback status" });
    }
};

export const getAllFeedbackController = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as 'PENDING' | 'REVIEWED' | 'IMPLEMENTED' | 'REJECTED' | undefined;
        const domain = req.query.domain as 'TEC' | 'SIL' | 'EDU' | undefined;

        const response = await getAllFeedback(page, limit, status, domain);

        res.status(200).json(response);
    } catch (error) {
        console.error("Error in getAllFeedbackController:", error);
        res.status(500).json({ error: "Failed to fetch feedback" });
    }
};

export const getUserFeedbackController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }

        const feedback = await getUserFeedback(userId);

        res.status(200).json(feedback);
    } catch (error) {
        console.error("Error in getUserFeedbackController:", error);
        res.status(500).json({ error: "Failed to fetch user feedback" });
    }
};