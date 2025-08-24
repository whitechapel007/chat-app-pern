import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import * as userService from "../services/user.services.js";
import {
  getOnlineUsers,
  getUserSocketId,
  isUserOnline,
} from "../socket/index.js";
import { formatSuccessResponse } from "../utils/errors.js";

// Get all users with pagination and search
export const getAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    const { page, limit, search } = req.query;
    const excludeUserId = req.user.id; // Don't include the requesting user

    const result = await userService.getAllUsers({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      search: search as string,
      excludeUserId,
    });

    res
      .status(200)
      .json(formatSuccessResponse(result, "Users retrieved successfully"));
  }
);

// Get user by ID
export const getUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { message: "User ID is required", statusCode: 400 },
      });
    }

    const user = await userService.getUserById(userId);
    res
      .status(200)
      .json(formatSuccessResponse(user, "User retrieved successfully"));
  }
);

// Get user by username
export const getUserByUsername = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: { message: "Username is required", statusCode: 400 },
      });
    }

    const user = await userService.getUserByUsername(username);
    res
      .status(200)
      .json(formatSuccessResponse(user, "User retrieved successfully"));
  }
);

// Get current user profile
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    const user = await userService.getUserById(req.user.id);
    res
      .status(200)
      .json(formatSuccessResponse(user, "Current user retrieved successfully"));
  }
);

// Update current user profile
export const updateCurrentUserProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    const userId = req.user.id;
    const updateData = req.body;

    const updatedUser = await userService.updateUserProfile(userId, updateData);
    res
      .status(200)
      .json(formatSuccessResponse(updatedUser, "Profile updated successfully"));
  }
);

// Update user online status
export const updateOnlineStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    const userId = req.user.id;
    const { isOnline } = req.body;

    if (typeof isOnline !== "boolean") {
      return res.status(400).json({
        success: false,
        error: { message: "isOnline must be a boolean value", statusCode: 400 },
      });
    }

    const updatedUser = await userService.updateUserOnlineStatus(
      userId,
      isOnline
    );
    res
      .status(200)
      .json(
        formatSuccessResponse(updatedUser, "Online status updated successfully")
      );
  }
);

// Get user statistics
export const getUserStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    const { userId } = req.params;
    const targetUserId = userId || req.user.id; // Use provided userId or current user

    const stats = await userService.getUserStats(targetUserId);
    res
      .status(200)
      .json(
        formatSuccessResponse(stats, "User statistics retrieved successfully")
      );
  }
);

// Search users
export const searchUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    const { q: query, limit } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        error: { message: "Search query is required", statusCode: 400 },
      });
    }

    const excludeUserId = req.user.id;
    const searchLimit = limit ? parseInt(limit as string) : 10;

    const users = await userService.searchUsers(
      query,
      excludeUserId,
      searchLimit
    );
    res
      .status(200)
      .json(formatSuccessResponse(users, "Users found successfully"));
  }
);

// Get users for conversation (exclude current user and existing participants)
export const getUsersForConversation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    const { search } = req.query;
    const excludeUserId = req.user.id;

    const result = await userService.getAllUsers({
      page: 1,
      limit: 50, // Reasonable limit for conversation selection
      search: search as string,
      excludeUserId,
    });

    res
      .status(200)
      .json(
        formatSuccessResponse(
          result.users,
          "Users for conversation retrieved successfully"
        )
      );
  }
);

export const getUsersOnline = asyncHandler(
  async (req: Request, res: Response) => {
    const onlineUserIds = getOnlineUsers();
    const onlineUsersWithSockets = onlineUserIds.map((userId) => ({
      userId,
      socketId: getUserSocketId(userId),
      isOnline: isUserOnline(userId),
    }));

    res.json(
      formatSuccessResponse(
        {
          onlineUsers: onlineUsersWithSockets,
          totalOnline: onlineUserIds.length,
          timestamp: new Date().toISOString(),
        },
        "Online users retrieved successfully"
      )
    );
  }
);
