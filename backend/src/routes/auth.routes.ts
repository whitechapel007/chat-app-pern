import { Router } from "express";
import {
  changePassword,
  getProfile,
  logout,
  signin,
  signup,
} from "../controllers/auth.controller.js";
import { authenticateToken, rateLimit } from "../middleware/auth.middleware.js";

import {
  requireJSON,
  sanitizeBody,
  validateBody,
} from "../middleware/validation.middleware.js";
import {
  changePasswordSchema,
  signinSchema,
  signupSchema,
} from "../validators/auth.validator.js";

const router = Router();

// Rate limiting for auth routes (increased for development)
const authRateLimit = rateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes

// Public routes
router.post(
  "/signup",
  requireJSON,
  sanitizeBody(["fullname", "username", "email"]),
  validateBody(signupSchema),
  signup
);

router.post(
  "/signin",
  authRateLimit,
  requireJSON,
  sanitizeBody(["email"]),
  validateBody(signinSchema),
  signin
);

// Legacy route for backward compatibility
router.post(
  "/login",
  authRateLimit,
  requireJSON,
  sanitizeBody(["email"]),
  validateBody(signinSchema),
  signin
);

// Protected routes (require authentication)
router.post("/logout", authenticateToken, logout);

router.post(
  "/change-password",
  authenticateToken,
  requireJSON,
  validateBody(changePasswordSchema),
  changePassword
);

router.get("/me", authenticateToken, getProfile);

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth service is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
