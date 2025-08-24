import { Router } from "express";
import {
  getConversations,
  getMessages,
} from "../controllers/message.controller";
import {
  getAllUsers,
  getCurrentUser,
  getUserById,
  getUserByUsername,
  getUserStats,
  getUsersForConversation,
  searchUsers,
  updateCurrentUserProfile,
  updateOnlineStatus,
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  requireJSON,
  sanitizeBody,
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation.middleware";
import {
  conversationIdParamSchema,
  messageQuerySchema,
} from "../validators/message.validator";
import {
  onlineStatusSchema,
  paginationQuerySchema,
  searchQuerySchema,
  updateUserProfileSchema,
  userIdParamSchema,
  usernameParamSchema,
} from "../validators/user.validator";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get current user profile
router.get("/me", getCurrentUser);

// Update current user profile
router.put(
  "/me",
  requireJSON,
  sanitizeBody(["fullName", "profilePic"]),
  validateBody(updateUserProfileSchema),
  updateCurrentUserProfile
);

// Update online status
router.patch(
  "/me/status",
  requireJSON,
  validateBody(onlineStatusSchema),
  updateOnlineStatus
);

// Get current user statistics
router.get("/me/stats", getUserStats);

// Get current user's conversations
router.get("/conversations", getConversations);

// Get messages from a conversation
router.get(
  "/conversations/:conversationId/messages",
  validateParams(conversationIdParamSchema),
  validateQuery(messageQuerySchema),
  getMessages
);

// Get all users with pagination and search
router.get("/", validateQuery(paginationQuerySchema), getAllUsers);

// Search users
router.get("/search", validateQuery(searchQuerySchema), searchUsers);

// Get users for creating conversations (excludes current user)
router.get(
  "/for-conversation",
  validateQuery(paginationQuerySchema),
  getUsersForConversation
);

// Get user by ID
router.get("/:userId", validateParams(userIdParamSchema), getUserById);

// Get user statistics by ID
router.get("/:userId/stats", validateParams(userIdParamSchema), getUserStats);

// Get user by username
router.get(
  "/username/:username",
  validateParams(usernameParamSchema),
  getUserByUsername
);

export default router;
