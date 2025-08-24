import { asyncHandler } from "../middleware/error.middleware.js";
import * as messageService from "../services/message.services.js";
import { isUserOnline, sendToUser, sendToUsers } from "../socket/index.js";
import { formatSuccessResponse } from "../utils/errors.js";
// Get all conversations for a user
export const getConversations = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: "Not authenticated", statusCode: 401 },
        });
    }
    const conversations = await messageService.getUserConversations(req.user.id);
    res
        .status(200)
        .json(formatSuccessResponse(conversations, "Conversations retrieved successfully"));
});
// Send direct message to a user
export const sendDirectMessage = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: "Not authenticated", statusCode: 401 },
        });
    }
    const senderId = req.user.id;
    const { userId: receiverId } = req.params;
    const messageData = req.body;
    if (!receiverId) {
        return res.status(400).json({
            success: false,
            error: { message: "Receiver ID is required", statusCode: 400 },
        });
    }
    const result = await messageService.sendDirectMessage(senderId, receiverId, messageData);
    // Send real-time notification to receiver if they're online
    if (isUserOnline(receiverId)) {
        const notificationSent = sendToUser(receiverId, "new_message", {
            message: result.message,
            conversation: result.conversation,
            sender: req.user,
        });
        console.log(`📱 Real-time notification sent to user ${receiverId}: ${notificationSent}`);
    }
    else {
        console.log(`📴 User ${receiverId} is offline, notification will be delivered when they come online`);
    }
    res
        .status(201)
        .json(formatSuccessResponse(result, "Message sent successfully"));
});
// Send image message to a user
export const sendImageMessage = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: "Not authenticated", statusCode: 401 },
        });
    }
    const senderId = req.user.id;
    const { userId: receiverId } = req.params;
    if (!receiverId) {
        return res.status(400).json({
            success: false,
            error: { message: "Receiver ID is required", statusCode: 400 },
        });
    }
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: { message: "Image file is required", statusCode: 400 },
        });
    }
    // Generate image URL (adjust based on your setup)
    const imageUrl = `/uploads/images/${req.file.filename}`;
    const messageData = {
        content: imageUrl, // Store the image URL as content
        type: "IMAGE",
    };
    const result = await messageService.sendDirectMessage(senderId, receiverId, messageData);
    res
        .status(201)
        .json(formatSuccessResponse(result, "Image message sent successfully"));
});
// Send image to existing conversation
export const sendImageToConversation = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: "Not authenticated", statusCode: 401 },
        });
    }
    const senderId = req.user.id;
    const { conversationId } = req.params;
    if (!conversationId) {
        return res.status(400).json({
            success: false,
            error: { message: "Conversation ID is required", statusCode: 400 },
        });
    }
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: { message: "Image file is required", statusCode: 400 },
        });
    }
    // Generate image URL
    const imageUrl = `/uploads/images/${req.file.filename}`;
    const messageData = {
        content: imageUrl,
        type: "IMAGE",
    };
    const result = await messageService.sendMessage(senderId, conversationId, messageData);
    res
        .status(201)
        .json(formatSuccessResponse(result, "Image message sent successfully"));
});
// Send a message to a conversation
export const sendMessage = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: "Not authenticated", statusCode: 401 },
        });
    }
    // Extract data from request
    const senderId = req.user.id; // ✅ Access req.user.id
    const { conversationId } = req.params; // ✅ Access req.params
    const messageData = req.body; // ✅ Access req.body
    // Call service layer with extracted data
    const result = await messageService.sendMessage(senderId, conversationId, messageData);
    // Send real-time notifications to all participants except sender
    // First, get the conversation with participants
    const conversation = await messageService.getConversationById(conversationId);
    if (conversation && conversation.participants) {
        const participantIds = conversation.participants
            .map((p) => p.userId)
            .filter((userId) => userId !== senderId); // Exclude sender
        const sentTo = sendToUsers(participantIds, "new_message", {
            message: result,
            conversation: conversation,
            sender: req.user,
        });
        console.log(`📱 Group message notification sent to ${sentTo.length}/${participantIds.length} participants`);
        console.log(`📱 Online participants: ${sentTo.join(", ")}`);
    }
    res
        .status(201)
        .json(formatSuccessResponse(result, "Message sent successfully"));
});
// Get messages from a conversation
export const getMessages = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: "Not authenticated", statusCode: 401 },
        });
    }
    // Extract data from request
    const userId = req.user.id; // ✅ Access req.user.id
    const { conversationId } = req.params; // ✅ Access req.params
    // Parse query parameters with proper type conversion
    const { page, limit, before, after } = req.query;
    const parsedPage = page ? parseInt(page) : 1;
    const parsedLimit = limit ? parseInt(limit) : 20;
    const queryOptions = {
        page: isNaN(parsedPage) ? 1 : parsedPage,
        limit: isNaN(parsedLimit) ? 20 : parsedLimit,
        before: before,
        after: after,
    };
    // Call service layer with extracted data
    const result = await messageService.getMessages(userId, conversationId, queryOptions);
    res
        .status(200)
        .json(formatSuccessResponse(result, "Messages retrieved successfully"));
});
// Delete a message
export const deleteMessage = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: "Not authenticated", statusCode: 401 },
        });
    }
    // Extract data from request
    const userId = req.user.id; // ✅ Access req.user.id
    const { messageId } = req.params; // ✅ Access req.params
    // Call service layer with extracted data
    const result = await messageService.deleteMessage(userId, messageId);
    res
        .status(200)
        .json(formatSuccessResponse(result, "Message deleted successfully"));
});
// Update a message
export const updateMessage = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: "Not authenticated", statusCode: 401 },
        });
    }
    // Extract data from request
    const userId = req.user.id; // ✅ Access req.user.id
    const { messageId } = req.params; // ✅ Access req.params
    const updateData = req.body; // ✅ Access req.body
    // Call service layer with extracted data
    const result = await messageService.updateMessage(userId, messageId, updateData);
    res
        .status(200)
        .json(formatSuccessResponse(result, "Message updated successfully"));
});
// Legacy function for backward compatibility
export const conversations = getConversations;
// Create group conversation
export const createGroupConversation = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: "Not authenticated", statusCode: 401 },
        });
    }
    const creatorId = req.user.id;
    const conversationData = req.body;
    const result = await messageService.createGroupConversation(creatorId, conversationData);
    res
        .status(201)
        .json(formatSuccessResponse(result, "Group conversation created successfully"));
});
// Add participant to group
export const addParticipantToGroup = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: "Not authenticated", statusCode: 401 },
        });
    }
    const addedByUserId = req.user.id;
    const { conversationId } = req.params;
    const { userId } = req.body;
    if (!conversationId) {
        return res.status(400).json({
            success: false,
            error: { message: "Conversation ID is required", statusCode: 400 },
        });
    }
    if (!userId) {
        return res.status(400).json({
            success: false,
            error: { message: "User ID is required", statusCode: 400 },
        });
    }
    const result = await messageService.addParticipantToGroup(conversationId, userId, addedByUserId);
    res
        .status(200)
        .json(formatSuccessResponse(result, "Participant added successfully"));
});
// Remove participant from group
export const removeParticipantFromGroup = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: "Not authenticated", statusCode: 401 },
        });
    }
    const removedByUserId = req.user.id;
    const { conversationId, userId } = req.params;
    if (!conversationId) {
        return res.status(400).json({
            success: false,
            error: { message: "Conversation ID is required", statusCode: 400 },
        });
    }
    if (!userId) {
        return res.status(400).json({
            success: false,
            error: { message: "User ID is required", statusCode: 400 },
        });
    }
    const result = await messageService.removeParticipantFromGroup(conversationId, userId, removedByUserId);
    res
        .status(200)
        .json(formatSuccessResponse(result, "Participant removed successfully"));
});
// Update group conversation
export const updateGroupConversation = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: "Not authenticated", statusCode: 401 },
        });
    }
    const userId = req.user.id;
    const { conversationId } = req.params;
    const updates = req.body;
    if (!conversationId) {
        return res.status(400).json({
            success: false,
            error: { message: "Conversation ID is required", statusCode: 400 },
        });
    }
    const result = await messageService.updateGroupConversation(conversationId, userId, updates);
    res
        .status(200)
        .json(formatSuccessResponse(result, "Group conversation updated successfully"));
});
//# sourceMappingURL=message.controller.js.map