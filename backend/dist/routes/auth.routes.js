import { Router } from "express";
import { changePassword, getProfile, logout, signin, signup, } from "../controllers/auth.controller";
import { authenticateToken, rateLimit } from "../middleware/auth.middleware";
import { requireJSON, sanitizeBody, validateBody, } from "../middleware/validation.middleware";
import { changePasswordSchema, signinSchema, signupSchema, } from "../validators/auth.validator";
const router = Router();
// Rate limiting for auth routes
const authRateLimit = rateLimit(10, 15 * 60 * 1000); // 10 requests per 15 minutes
// Public routes
router.post("/signup", authRateLimit, requireJSON, sanitizeBody(["fullname", "username", "email"]), validateBody(signupSchema), signup);
router.post("/signin", authRateLimit, requireJSON, sanitizeBody(["email"]), validateBody(signinSchema), signin);
// Legacy route for backward compatibility
router.post("/login", authRateLimit, requireJSON, sanitizeBody(["email"]), validateBody(signinSchema), signin);
// Protected routes (require authentication)
router.post("/logout", authenticateToken, logout);
router.post("/change-password", authenticateToken, requireJSON, validateBody(changePasswordSchema), changePassword);
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
//# sourceMappingURL=auth.routes.js.map