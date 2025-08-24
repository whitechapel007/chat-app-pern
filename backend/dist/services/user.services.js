import { prisma } from "../lib/prisma.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { validateInput } from "../validators/message.validator.js";
import { updateUserProfileSchema } from "../validators/user.validator.js";
// Get all users with pagination and search
export const getAllUsers = async (options = {}) => {
    const { page = 1, limit = 20, search, excludeUserId } = options;
    // Build where clause
    const whereClause = {};
    // Exclude specific user (usually the requesting user)
    if (excludeUserId) {
        whereClause.id = { not: excludeUserId };
    }
    // Search functionality
    if (search && search.trim()) {
        whereClause.OR = [
            { username: { contains: search.trim(), mode: "insensitive" } },
            { fullName: { contains: search.trim(), mode: "insensitive" } },
            { email: { contains: search.trim(), mode: "insensitive" } },
        ];
    }
    // Get users with pagination
    const users = await prisma.user.findMany({
        where: whereClause,
        select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            profilePic: true,
            gender: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
        },
        orderBy: [
            { isOnline: "desc" }, // Online users first
            { lastSeen: "desc" }, // Then by last seen
            { username: "asc" }, // Then alphabetically
        ],
        take: limit,
        skip: (page - 1) * limit,
    });
    // Get total count for pagination
    const totalCount = await prisma.user.count({ where: whereClause });
    return {
        users,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNext: page * limit < totalCount,
            hasPrev: page > 1,
        },
    };
};
// Get user by ID
export const getUserById = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            profilePic: true,
            gender: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        throw new NotFoundError("User not found");
    }
    return user;
};
// Get user by username
export const getUserByUsername = async (username) => {
    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            profilePic: true,
            gender: true,
            isOnline: true,
            lastSeen: true,
            createdAt: true,
        },
    });
    if (!user) {
        throw new NotFoundError("User not found");
    }
    return user;
};
// Update user profile (by user themselves)
export const updateUserProfile = async (userId, data) => {
    // Validate input data
    const { value: validatedData, error } = validateInput(updateUserProfileSchema, data);
    if (error) {
        throw new ValidationError(error);
    }
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!existingUser) {
        throw new NotFoundError("User not found");
    }
    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            ...validatedData,
            updatedAt: new Date(),
        },
        select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            profilePic: true,
            gender: true,
            isOnline: true,
            lastSeen: true,
            updatedAt: true,
        },
    });
    return updatedUser;
};
// Update user online status
export const updateUserOnlineStatus = async (userId, isOnline) => {
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            isOnline,
            lastSeen: new Date(),
            updatedAt: new Date(),
        },
        select: {
            id: true,
            username: true,
            isOnline: true,
            lastSeen: true,
        },
    });
    return updatedUser;
};
// Get user's conversations count
export const getUserStats = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });
    if (!user) {
        throw new NotFoundError("User not found");
    }
    // Count conversations
    const conversationsCount = await prisma.conversationParticipant.count({
        where: { userId },
    });
    // Count messages sent
    const messagesSentCount = await prisma.message.count({
        where: { senderId: userId },
    });
    return {
        conversationsCount,
        messagesSentCount,
    };
};
// Search users (for adding to conversations)
export const searchUsers = async (query, excludeUserId, limit = 10) => {
    if (!query || query.trim().length < 2) {
        return [];
    }
    const whereClause = {
        OR: [
            { username: { contains: query.trim(), mode: "insensitive" } },
            { fullName: { contains: query.trim(), mode: "insensitive" } },
        ],
    };
    if (excludeUserId) {
        whereClause.id = { not: excludeUserId };
    }
    const users = await prisma.user.findMany({
        where: whereClause,
        select: {
            id: true,
            username: true,
            fullName: true,
            profilePic: true,
            isOnline: true,
        },
        take: limit,
        orderBy: [{ isOnline: "desc" }, { username: "asc" }],
    });
    return users;
};
//# sourceMappingURL=user.services.js.map