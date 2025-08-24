import multer from "multer";
import path from "path";
import { ValidationError } from "../utils/errors";
// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Store in uploads/images directory
        cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-randomstring.extension
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, `image-${uniqueSuffix}${extension}`);
    },
});
// File filter for images only
const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    }
    else {
        cb(new ValidationError("Only image files are allowed"));
    }
};
// Configure multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1, // Only one file at a time
    },
});
// Middleware for single image upload
export const uploadImage = upload.single("image");
// Middleware for handling upload errors
export const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                error: {
                    message: "File too large. Maximum size is 5MB",
                    statusCode: 400,
                },
            });
        }
        if (error.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                error: {
                    message: "Too many files. Only one image allowed",
                    statusCode: 400,
                },
            });
        }
    }
    if (error.message === "Only image files are allowed") {
        return res.status(400).json({
            success: false,
            error: {
                message: error.message,
                statusCode: 400,
            },
        });
    }
    next(error);
};
//# sourceMappingURL=upload.middleware.js.map