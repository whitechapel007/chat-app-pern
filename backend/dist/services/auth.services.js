// services/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AuthenticationError, ConflictError, NotFoundError, ValidationError, } from "../utils/errors";
import { changePasswordSchema, signinSchema, signupSchema, validateInput, } from "../validators/auth.validator";
// Generate JWT token
const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
        issuer: "pern-chat-app",
        audience: "pern-chat-users",
    });
};
// Hash password with salt
const hashPassword = async (password) => {
    const saltRounds = 12; // Increased from 10 for better security
    return await bcrypt.hash(password, saltRounds);
};
// Verify password
const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
//signup
export const signup = async (data) => {
    // Validate input data
    const { value: validatedData, error } = validateInput(signupSchema, data);
    if (error) {
        throw new ValidationError(error);
    }
    const { fullname, username, email, password, gender } = validatedData;
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });
    if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
            throw new ConflictError("An account with this email already exists");
        }
        if (existingUser.username === username.toLowerCase()) {
            throw new ConflictError("This username is already taken");
        }
    }
    // Hash password
    const hashedPassword = await hashPassword(password);
    const profilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    // Create user
    const user = await prisma.user.create({
        data: {
            fullName: fullname.trim(),
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            gender: gender, // Cast to match enum
            profilePic: profilePic,
        },
        select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            gender: true,
            createdAt: true,
        },
    });
    // Generate token
    const token = generateToken(user.id);
    return {
        user,
        token,
    };
};
export const signin = async (data) => {
    // Validate input data
    const { value: validatedData, error } = validateInput(signinSchema, data);
    if (error) {
        throw new ValidationError(error);
    }
    const { email, password } = validatedData;
    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            password: true,
            gender: true,
            isOnline: true,
            createdAt: true,
        },
    });
    if (!user) {
        throw new AuthenticationError("Invalid email or password");
    }
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
        throw new AuthenticationError("Invalid email or password");
    }
    // Update user online status
    await prisma.user.update({
        where: { id: user.id },
        data: {
            isOnline: true,
            lastSeen: new Date(),
        },
    });
    // Generate token
    const token = generateToken(user.id);
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        token,
    };
};
export const logout = async (userId) => {
    // Update user online status
    await prisma.user.update({
        where: { id: userId },
        data: {
            isOnline: false,
            lastSeen: new Date(),
        },
    });
    // For JWT, logout is handled client-side (remove token)
    // For sessions, you would destroy the session here
    return { message: "Logged out successfully" };
};
export const changePassword = async (userId, data) => {
    // Validate input data
    const { value: validatedData, error } = validateInput(changePasswordSchema, data);
    if (error) {
        throw new ValidationError(error);
    }
    const { currentPassword, newPassword } = validatedData;
    // Get user with current password
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
    });
    if (!user) {
        throw new NotFoundError("User not found");
    }
    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new AuthenticationError("Current password is incorrect");
    }
    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);
    // Update password
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });
    return { message: "Password changed successfully" };
};
export const getUserProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            gender: true,
            profilePic: true,
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
//# sourceMappingURL=auth.services.js.map