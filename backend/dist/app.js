import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { rateLimit } from "./middleware/auth.middleware.js";
import { errorHandler as newErrorHandler, notFoundHandler, } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
const app = express();
// Needed because __dirname doesn’t exist in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"] // Replace with your production domain
        : ["http://localhost:3000", "http://localhost:5173"], // Common dev ports
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
}));
// General middleware
app.use(morgan("short")); // More detailed logging
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
// Serve static files (uploaded images)
app.use("/uploads", express.static("uploads"));
// Serve static files from frontend build
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
// Global rate limiting
app.use(rateLimit(1000, 9 * 60 * 1000));
// 1200 requests per 9 minutes (1000 for auth routes)
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
// 3. Catch-all handler for React Router (must come AFTER API routes)
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../frontend/dist", "index.html"));
});
// 404 handler for undefined routes
app.use(notFoundHandler);
// Global error handler (must be last)
app.use(newErrorHandler);
export default app;
//# sourceMappingURL=app.js.map