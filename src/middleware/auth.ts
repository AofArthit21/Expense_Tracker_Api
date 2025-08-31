import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

export interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided or invalid format.",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Token is valid but user no longer exists.",
      });
      return;
    }

    // Add user info to request object
    req.user = user;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
