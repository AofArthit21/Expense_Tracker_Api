import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: any;
  errors?: any;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error("Error:", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err instanceof mongoose.Error.CastError) {
    const message = "Resource not found";
    error = { ...error, message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const message = `${field} already exists`;
    error = { ...error, message, statusCode: 400 };
  }

  // Mongoose validation error
  if (
    err.name === "ValidationError" &&
    err instanceof mongoose.Error.ValidationError
  ) {
    const message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(", ");
    error = { ...error, message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { ...error, message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { ...error, message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
