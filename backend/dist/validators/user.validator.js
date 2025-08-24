import Joi from "joi";
// Schema for updating user profile (by user themselves)
export const updateUserProfileSchema = Joi.object({
    fullName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
        "string.min": "Full name must be at least 2 characters long",
        "string.max": "Full name cannot exceed 100 characters",
        "string.pattern.base": "Full name can only contain letters and spaces",
    })
        .optional(),
    profilePic: Joi.string()
        .uri()
        .max(500)
        .messages({
        "string.uri": "Profile picture must be a valid URL",
        "string.max": "Profile picture URL cannot exceed 500 characters",
    })
        .optional(),
})
    .min(1)
    .messages({
    "object.min": "At least one field must be provided for update",
});
// Schema for admin updating user data
export const updateUserSchema = Joi.object({
    fullName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
        "string.min": "Full name must be at least 2 characters long",
        "string.max": "Full name cannot exceed 100 characters",
        "string.pattern.base": "Full name can only contain letters and spaces",
    })
        .optional(),
    profilePic: Joi.string()
        .uri()
        .max(500)
        .messages({
        "string.uri": "Profile picture must be a valid URL",
        "string.max": "Profile picture URL cannot exceed 500 characters",
    })
        .optional(),
    gender: Joi.string()
        .valid("male", "female")
        .messages({
        "any.only": "Gender must be either 'male' or 'female'",
    })
        .optional(),
})
    .min(1)
    .messages({
    "object.min": "At least one field must be provided for update",
});
// Schema for user ID parameter validation
export const userIdParamSchema = Joi.object({
    userId: Joi.string()
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .required()
        .messages({
        "string.pattern.base": "Invalid user ID format",
        "any.required": "User ID is required",
    }),
});
// Schema for username parameter validation
export const usernameParamSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
        "string.alphanum": "Username can only contain letters and numbers",
        "string.min": "Username must be at least 3 characters long",
        "string.max": "Username cannot exceed 30 characters",
        "any.required": "Username is required",
    }),
});
// Schema for search query validation
export const searchQuerySchema = Joi.object({
    q: Joi.string().min(2).max(50).trim().required().messages({
        "string.min": "Search query must be at least 2 characters long",
        "string.max": "Search query cannot exceed 50 characters",
        "any.required": "Search query is required",
    }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(10)
        .messages({
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 50",
    })
        .optional(),
});
// Schema for pagination query validation
export const paginationQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
        "number.min": "Page must be at least 1",
    })
        .optional(),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
        .messages({
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 100",
    })
        .optional(),
    search: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .messages({
        "string.min": "Search query must be at least 2 characters long",
        "string.max": "Search query cannot exceed 50 characters",
    })
        .optional(),
});
// Schema for online status update
export const onlineStatusSchema = Joi.object({
    isOnline: Joi.boolean().required().messages({
        "any.required": "Online status is required",
        "boolean.base": "Online status must be a boolean value",
    }),
});
//# sourceMappingURL=user.validator.js.map