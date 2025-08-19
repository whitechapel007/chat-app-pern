import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { NextFunction, Request, Response } from "express";
import { AppError, formatErrorResponse } from "../utils/errors";

// Global error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging
  console.error("Error:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    return handlePrismaError(error, res);
  }

  // Handle custom application errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(formatErrorResponse(error));
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: {
        message: "Invalid token",
        statusCode: 401,
      },
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: {
        message: "Token expired",
        statusCode: 401,
      },
    });
  }

  // Handle validation errors from other libraries
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400,
      },
    });
  }

  // Handle multer errors (file upload)
  if (error.name === "MulterError") {
    let message = "File upload error";
    if (error.message.includes("File too large")) {
      message = "File size too large";
    } else if (error.message.includes("Unexpected field")) {
      message = "Unexpected file field";
    }

    return res.status(400).json({
      success: false,
      error: {
        message,
        statusCode: 400,
      },
    });
  }

  // Default error response
  const statusCode = process.env.NODE_ENV === "production" ? 500 : 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error.message;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
    },
  });
};

// Handle Prisma-specific errors
const handlePrismaError = (
  error: PrismaClientKnownRequestError,
  res: Response
) => {
  switch (error.code) {
    case "P2002":
      // Unique constraint violation
      const field = error.meta?.target as string[] | undefined;
      const fieldName = field?.[0] || "field";
      return res.status(409).json({
        success: false,
        error: {
          message: `A record with this ${fieldName} already exists`,
          statusCode: 409,
        },
      });

    case "P2025":
      // Record not found
      return res.status(404).json({
        success: false,
        error: {
          message: "Record not found",
          statusCode: 404,
        },
      });

    case "P2003":
      // Foreign key constraint violation
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid reference to related record",
          statusCode: 400,
        },
      });

    case "P2014":
      // Required relation violation
      return res.status(400).json({
        success: false,
        error: {
          message: "Required relation is missing",
          statusCode: 400,
        },
      });

    default:
      return res.status(500).json({
        success: false,
        error: {
          message: "Database error occurred",
          statusCode: 500,
        },
      });
  }
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      statusCode: 404,
    },
  });
};

// Async error wrapper to catch async errors in route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
