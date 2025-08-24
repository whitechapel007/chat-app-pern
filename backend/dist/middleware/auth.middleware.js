import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { AuthenticationError, AuthorizationError } from "../utils/errors.js";
// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
    try {
        // Try to get token from multiple sources (industry best practice)
        let token;
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
            token = req.headers["x-auth-token"];
        }
        if (!token) {
            throw new AuthenticationError("Access token is required");
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AuthenticationError("Invalid token"));
        }
        else if (error instanceof jwt.TokenExpiredError) {
            next(new AuthenticationError("Token expired"));
        }
        else {
            next(error);
        }
    }
};
// Middleware to check if user is authenticated (optional)
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (token && process.env.JWT_SECRET) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    }
    catch (error) {
        // For optional auth, we don't throw errors, just continue without user
        next();
    }
};
// Middleware to check if user owns the resource
export const requireOwnership = (resourceIdParam = "id") => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationError("Authentication required"));
        }
        const resourceId = req.params[resourceIdParam];
        const userId = req.user.id;
        if (resourceId !== userId) {
            return next(new AuthorizationError("Access denied: You can only access your own resources"));
        }
        next();
    };
};
// Rate limiting middleware (basic implementation)
const requestCounts = new Map();
export const rateLimit = (maxRequests = 1200, windowMs = 9 * 60 * 1000) => {
    return (req, res, next) => {
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
//# sourceMappingURL=auth.middleware.js.map