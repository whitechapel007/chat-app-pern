import type { NextFunction, Request, Response } from "express";
import Joi from "joi";
export declare const validate: (schema: Joi.ObjectSchema, source?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateBody: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateParams: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const idParamSchema: Joi.ObjectSchema<any>;
export declare const paginationQuerySchema: Joi.ObjectSchema<any>;
export declare const fileUploadSchema: Joi.ObjectSchema<any>;
export declare const sanitizeInput: (input: string) => string;
export declare const sanitizeBody: (fields: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireContentType: (contentType: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireJSON: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map