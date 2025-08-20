import type { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { ValidationError } from "../utils/errors";

// Generic validation middleware factory
export const validate = (
  schema: Joi.ObjectSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      return next(new ValidationError(errorMessage));
    }

    // Replace the original data with validated and sanitized data
    // Note: req.query is read-only in Express, so we skip assignment for query
    if (source !== "query") {
      req[source] = value;
    }
    // For query validation, we just validate but don't replace the original
    next();
  };
};

// Specific validation middlewares for common use cases
export const validateBody = (schema: Joi.ObjectSchema) =>
  validate(schema, "body");
export const validateQuery = (schema: Joi.ObjectSchema) =>
  validate(schema, "query");
export const validateParams = (schema: Joi.ObjectSchema) =>
  validate(schema, "params");

// Common parameter schemas
export const idParamSchema = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "ID parameter is required",
    "string.empty": "ID parameter cannot be empty",
  }),
});

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

// File upload validation
export const fileUploadSchema = Joi.object({
  mimetype: Joi.string()
    .valid("image/jpeg", "image/png", "image/gif", "image/webp")
    .required()
    .messages({
      "any.only": "Only JPEG, PNG, GIF, and WebP images are allowed",
    }),
  size: Joi.number()
    .max(5 * 1024 * 1024)
    .required()
    .messages({
      "number.max": "File size must not exceed 5MB",
    }),
});

// Sanitization helpers
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
};

// XSS protection middleware
export const sanitizeBody = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === "object") {
      fields.forEach((field) => {
        if (req.body[field] && typeof req.body[field] === "string") {
          req.body[field] = sanitizeInput(req.body[field]);
        }
      });
    }
    next();
  };
};

// Content-Type validation
export const requireContentType = (contentType: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.is(contentType)) {
      return next(new ValidationError(`Content-Type must be ${contentType}`));
    }
    next();
  };
};

// JSON validation middleware
export const requireJSON = requireContentType("application/json");
