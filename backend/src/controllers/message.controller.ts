import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import * as messageService from "../services/message.services";
import { formatSuccessResponse } from "../utils/errors";

// Extend Request type for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Get all conversations for a user
export const getConversations = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    const conversations = await messageService.getUserConversations(
      req.user.id
    );
    res
      .status(200)
      .json(
        formatSuccessResponse(
          conversations,
          "Conversations retrieved successfully"
        )
      );
  }
);

// Send direct message to a user
export const sendDirectMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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

    const result = await messageService.sendDirectMessage(
      senderId,
      receiverId,
      messageData
    );
    res
      .status(201)
      .json(formatSuccessResponse(result, "Message sent successfully"));
  }
);

// Send image message to a user
export const sendImageMessage = asyncHandler(
  async (req: MulterRequest, res: Response, next: NextFunction) => {
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
      type: "IMAGE" as const,
    };

    const result = await messageService.sendDirectMessage(
      senderId,
      receiverId,
      messageData
    );

    res
      .status(201)
      .json(formatSuccessResponse(result, "Image message sent successfully"));
  }
);

// Send image to existing conversation
export const sendImageToConversation = asyncHandler(
  async (req: MulterRequest, res: Response, next: NextFunction) => {
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
      type: "IMAGE" as const,
    };

    const result = await messageService.sendMessage(
      senderId,
      conversationId,
      messageData
    );

    res
      .status(201)
      .json(formatSuccessResponse(result, "Image message sent successfully"));
  }
);

// Send a message to a conversation
export const sendMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    // Extract data from request
    const senderId = req.user.id; // ✅ Access req.user.id
    const { conversationId } = req.params as {
      conversationId: string;
    }; // ✅ Access req.params
    const messageData = req.body; // ✅ Access req.body

    // Call service layer with extracted data
    const result = await messageService.sendMessage(
      senderId,
      conversationId,
      messageData
    );

    res
      .status(201)
      .json(formatSuccessResponse(result, "Message sent successfully"));
  }
);

// Get messages from a conversation
export const getMessages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    // Extract data from request
    const userId = req.user.id; // ✅ Access req.user.id
    const { conversationId } = req.params as {
      conversationId: string;
    }; // ✅ Access req.params

    // Parse query parameters with proper type conversion
    const { page, limit, before, after } = req.query;
    const parsedPage = page ? parseInt(page as string) : 1;
    const parsedLimit = limit ? parseInt(limit as string) : 20;

    const queryOptions = {
      page: isNaN(parsedPage) ? 1 : parsedPage,
      limit: isNaN(parsedLimit) ? 20 : parsedLimit,
      before: before as string,
      after: after as string,
    };

    // Call service layer with extracted data
    const result = await messageService.getMessages(
      userId,
      conversationId,
      queryOptions
    );

    res
      .status(200)
      .json(formatSuccessResponse(result, "Messages retrieved successfully"));
  }
);

// Delete a message
export const deleteMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    // Extract data from request
    const userId = req.user.id; // ✅ Access req.user.id
    const { messageId } = req.params as {
      messageId: string;
    }; // ✅ Access req.params

    // Call service layer with extracted data
    const result = await messageService.deleteMessage(userId, messageId);

    res
      .status(200)
      .json(formatSuccessResponse(result, "Message deleted successfully"));
  }
);

// Update a message
export const updateMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    // Extract data from request
    const userId = req.user.id; // ✅ Access req.user.id
    const { messageId } = req.params as {
      messageId: string;
    }; // ✅ Access req.params
    const updateData = req.body; // ✅ Access req.body

    // Call service layer with extracted data
    const result = await messageService.updateMessage(
      userId,
      messageId,
      updateData
    );

    res
      .status(200)
      .json(formatSuccessResponse(result, "Message updated successfully"));
  }
);

// Legacy function for backward compatibility
export const conversations = getConversations;

// Create group conversation
export const createGroupConversation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    const creatorId = req.user.id;
    const conversationData = req.body;

    const result = await messageService.createGroupConversation(
      creatorId,
      conversationData
    );

    res
      .status(201)
      .json(
        formatSuccessResponse(result, "Group conversation created successfully")
      );
  }
);

// Add participant to group
export const addParticipantToGroup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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

    const result = await messageService.addParticipantToGroup(
      conversationId,
      userId,
      addedByUserId
    );

    res
      .status(200)
      .json(formatSuccessResponse(result, "Participant added successfully"));
  }
);

// Remove participant from group
export const removeParticipantFromGroup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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

    const result = await messageService.removeParticipantFromGroup(
      conversationId,
      userId,
      removedByUserId
    );

    res
      .status(200)
      .json(formatSuccessResponse(result, "Participant removed successfully"));
  }
);

// Update group conversation
export const updateGroupConversation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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

    const result = await messageService.updateGroupConversation(
      conversationId,
      userId,
      updates
    );

    res
      .status(200)
      .json(
        formatSuccessResponse(result, "Group conversation updated successfully")
      );
  }
);
