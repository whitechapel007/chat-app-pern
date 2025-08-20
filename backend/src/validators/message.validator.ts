import Joi from "joi";

// Message content validation schema
const messageContentSchema = Joi.string().min(1).max(1000).required().messages({
  "string.min": "Message cannot be empty",
  "string.max": "Message must not exceed 1000 characters",
  "any.required": "Message content is required",
});

// Send message validation schema (object schema)
export const messageSchema = Joi.object({
  content: messageContentSchema,
  type: Joi.string()
    .valid("TEXT", "IMAGE", "FILE", "SYSTEM")
    .default("TEXT")
    .optional(),
}).options({ stripUnknown: true });

// Legacy string schema for backward compatibility
export const messageContentOnlySchema = Joi.string().min(1).max(1000).messages({
  "string.min": "Message should be more than 1 character",
  "string.max": "Message should not exceed 1000 characters",
});

// Parameter validation schemas
export const conversationIdParamSchema = Joi.object({
  conversationId: Joi.string().required().messages({
    "any.required": "Conversation ID is required",
  }),
});

export const userIdParamSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
});

// Schema for group conversation creation
export const groupConversationSchema = Joi.object({
  type: Joi.string().valid("GROUP").required().messages({
    "any.required": "Conversation type is required",
    "any.only": "Type must be GROUP",
  }),

  name: Joi.string().min(1).max(100).trim().required().messages({
    "any.required": "Group name is required",
    "string.min": "Group name cannot be empty",
    "string.max": "Group name cannot exceed 100 characters",
  }),

  description: Joi.string().max(500).trim().optional().allow("").messages({
    "string.max": "Description cannot exceed 500 characters",
  }),

  participantIds: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .max(50)
    .required()
    .messages({
      "any.required": "Participant IDs are required",
      "array.min": "At least one participant is required",
      "array.max": "Cannot have more than 50 participants",
    }),
});

// Schema for conversation participant params (conversationId + userId)
export const conversationParticipantParamSchema = Joi.object({
  conversationId: Joi.string().required().messages({
    "any.required": "Conversation ID is required",
    "string.empty": "Conversation ID cannot be empty",
  }),

  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
    "string.empty": "User ID cannot be empty",
  }),
});

// Validation helper function
export const validateInput = <T>(
  schema: Joi.ObjectSchema,
  data: any
): { value: T; error?: string } => {
  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return { value, error: errorMessage };
  }

  return { value };
};
