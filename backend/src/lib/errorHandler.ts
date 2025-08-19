// utils/errorHandler.ts
import type { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  res.status(400).json({ error: err.message || "Something went wrong" });
};
