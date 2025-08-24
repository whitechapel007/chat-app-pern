import { Router } from "express";
import { addParticipantToGroup, createGroupConversation, deleteMessage, getConversations, getMessages, removeParticipantFromGroup, sendDirectMessage, sendImageMessage, sendImageToConversation, sendMessage, updateGroupConversation, updateMessage, } from "../controllers/message.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { handleUploadError, uploadImage, } from "../middleware/upload.middleware";
import { requireJSON, sanitizeBody, validateBody, validateParams, validateQuery, } from "../middleware/validation.middleware";
import { conversationIdParamSchema, conversationParticipantParamSchema, groupConversationSchema, messageQuerySchema, messageSchema, } from "../validators/message.validator";
const router = Router();
// All routes require authentication
router.use(authenticateToken);
// Get all conversations for authenticated user
router.get("/conversations", getConversations);
// Send direct message to a user (creates conversation if needed)
router.post("/users/:userId/messages", requireJSON, sanitizeBody(["content"]), validateBody(messageSchema), sendDirectMessage);
// Send image message to a user (creates conversation if needed)
router.post("/users/:userId/images", uploadImage, handleUploadError, sendImageMessage);
// Send message to a conversation
router.post("/conversations/:conversationId/messages", requireJSON, validateParams(conversationIdParamSchema), sanitizeBody(["content"]), validateBody(messageSchema), sendMessage);
// Send image to existing conversation
router.post("/conversations/:conversationId/images", uploadImage, handleUploadError, validateParams(conversationIdParamSchema), sendImageToConversation);
// Get messages from a conversation
router.get("/conversations/:conversationId/messages", validateParams(conversationIdParamSchema), validateQuery(messageQuerySchema), getMessages);
// Update a specific message
router.put("/messages/:messageId", requireJSON, sanitizeBody(["content"]), validateBody(messageSchema), updateMessage);
// Delete a specific message
router.delete("/messages/:messageId", deleteMessage);
// Group conversation routes
// Create group conversation
router.post("/groups", requireJSON, sanitizeBody(["name", "description", "participantIds"]), validateBody(groupConversationSchema), createGroupConversation);
// Add participant to group
router.post("/conversations/:conversationId/participants", requireJSON, sanitizeBody(["userId"]), validateParams(conversationIdParamSchema), addParticipantToGroup);
// Remove participant from group
router.delete("/conversations/:conversationId/participants/:userId", validateParams(conversationParticipantParamSchema), removeParticipantFromGroup);
// Update group conversation
router.put("/conversations/:conversationId", requireJSON, sanitizeBody(["name", "description"]), validateParams(conversationIdParamSchema), updateGroupConversation);
export default router;
//# sourceMappingURL=message.routes.js.map