import Joi from "joi";
// Password validation schema with strong requirements
const passwordSchema = Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.+#^])[A-Za-z\\d@$!%*?&.+#^]{8,}$"))
    .required()
    .messages({
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must not exceed 128 characters",
    "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    "any.required": "Password is required",
});
// Email validation schema
const emailSchema = Joi.string()
    .email({ tlds: { allow: false } })
    .max(254)
    .required()
    .messages({
    "string.email": "Please provide a valid email address",
    "string.max": "Email must not exceed 254 characters",
    "any.required": "Email is required",
});
// Username validation schema
const usernameSchema = Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
    "string.alphanum": "Username must contain only alphanumeric characters",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username must not exceed 30 characters",
    "any.required": "Username is required",
});
// Full name validation schema
const fullnameSchema = Joi.string()
    .pattern(new RegExp("^[a-zA-Z\\s]+$"))
    .min(2)
    .max(100)
    .required()
    .messages({
    "string.pattern.base": "Full name must contain only letters and spaces",
    "string.min": "Full name must be at least 2 characters long",
    "string.max": "Full name must not exceed 100 characters",
    "any.required": "Full name is required",
});
// Gender validation schema
const genderSchema = Joi.string()
    .valid("male", "female", "other", "prefer-not-to-say")
    .required()
    .messages({
    "any.only": "Gender must be one of: male, female, other, prefer-not-to-say",
    "any.required": "Gender is required",
});
// Signup validation schema
export const signupSchema = Joi.object({
    fullname: fullnameSchema,
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    gender: genderSchema,
}).options({ stripUnknown: true });
// Signin validation schema
export const signinSchema = Joi.object({
    email: emailSchema,
    password: Joi.string().required().messages({
        "any.required": "Password is required",
    }),
}).options({ stripUnknown: true });
// Password reset request schema
export const passwordResetRequestSchema = Joi.object({
    email: emailSchema,
}).options({ stripUnknown: true });
// Password reset schema
export const passwordResetSchema = Joi.object({
    token: Joi.string().required().messages({
        "any.required": "Reset token is required",
    }),
    password: passwordSchema,
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
        "any.only": "Passwords do not match",
        "any.required": "Password confirmation is required",
    }),
}).options({ stripUnknown: true });
// Change password schema
export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        "any.required": "Current password is required",
    }),
    newPassword: passwordSchema,
}).options({ stripUnknown: true });
// Update profile schema
export const updateProfileSchema = Joi.object({
    fullname: fullnameSchema.optional(),
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    gender: genderSchema.optional(),
})
    .min(1)
    .options({ stripUnknown: true });
// Validation helper function
export const validateInput = (schema, data) => {
    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
        const errorMessage = error.details
            .map((detail) => detail.message)
            .join(", ");
        return { value, error: errorMessage };
    }
    return { value };
};
//# sourceMappingURL=auth.validator.js.map