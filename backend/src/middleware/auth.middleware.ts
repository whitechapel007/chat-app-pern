import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AuthenticationError, AuthorizationError } from "../utils/errors";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        fullName: string;
      };
    }
  }
}

export interface JWTPayload {
  id: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

// Middleware to verify JWT token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Try to get token from multiple sources (industry best practice)
    let token: string | undefined;

    // 1. Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Check HTTP-only cookie (more secure for web apps)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 3. Check custom header (for mobile apps)
    if (!token && req.headers["x-auth-token"]) {
      token = req.headers["x-auth-token"] as string;
    }

    if (!token) {
      throw new AuthenticationError("Access token is required");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isOnline: true,
        lastSeen: true,
        profilePic: true,
      },
    });

    if (!user) {
      throw new AuthenticationError("User not found");
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError("Invalid token"));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError("Token expired"));
    } else {
      next(error);
    }
  }
};

// Middleware to check if user is authenticated (optional)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (token && process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          isOnline: true,
        },
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};

// Middleware to check if user owns the resource
export const requireOwnership = (resourceIdParam: string = "id") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError("Authentication required"));
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user.id;

    if (resourceId !== userId) {
      return next(
        new AuthorizationError(
          "Access denied: You can only access your own resources"
        )
      );
    }

    next();
  };
};

// Rate limiting middleware (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (
  maxRequests: number = 1200,
  windowMs: number = 9 * 60 * 1000
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();

    const clientData = requestCounts.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      // Reset or initialize counter
      requestCounts.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          message: "Too many requests, please try again later",
          statusCode: 429,
        },
      });
    }

    clientData.count++;
    next();
  };
};

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [clientId, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(clientId);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes
