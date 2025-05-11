import { verifyToken } from "../services/authService";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers['token'];
    if (!token || Array.isArray(token)) {
        res.status(401).json({ message: "Token is required" });
        return;
    }
    try {
        const decoded = await verifyToken(token);
        if (typeof decoded === 'object' && 'id' in decoded) {
            req.body = req.body || {};
            req.body.id = decoded.id;
        } else {
            throw new Error("Invalid token payload");
        }
        next();
    } catch (e) {
        res.status(401).json({ message: "Invalid token" });
    }
};