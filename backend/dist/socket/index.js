import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma.js";
// Global map to store userId -> socketId mapping
const userSocketMap = new Map();
// Helper functions for user-socket mapping
export const getUserSocketId = (userId) => {
    return userSocketMap.get(userId);
};
export const getOnlineUsers = () => {
    return Array.from(userSocketMap.keys());
};
export const isUserOnline = (userId) => {
    return userSocketMap.has(userId);
};
// Store the io instance globally for use in other modules
let ioInstance = null;
export const getIoInstance = () => {
    return ioInstance;
};
// Send message to specific user
export const sendToUser = (userId, event, data) => {
    const socketId = getUserSocketId(userId);
    if (socketId && ioInstance) {
        ioInstance.to(socketId).emit(event, data);
        return true;
    }
    return false;
};
// Send message to multiple users
export const sendToUsers = (userIds, event, data) => {
    const sentTo = [];
    userIds.forEach((userId) => {
        if (sendToUser(userId, event, data)) {
            sentTo.push(userId);
        }
    });
    return sentTo;
};
// Broadcast to all connected users
export const broadcastToAll = (event, data) => {
    if (ioInstance) {
        ioInstance.emit(event, data);
    }
};
function createSocket(io) {
    // Store the io instance globally
    ioInstance = io;
    console.log("🚀 Socket.IO server initialized");
    console.log("🔧 Socket.IO server ready to accept connections");
    // helper function to parse cookies
    function parseCookies(cookieHeader) {
        if (!cookieHeader)
            return {};
        return cookieHeader
            .split(";")
            .reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split("=");
            if (key && value) {
                acc[key] = decodeURIComponent(value);
            }
            return acc;
        }, {});
    }
    io.on("connection", async (socket) => {
        console.log(`🔌 New socket connection attempt: ${socket.id}`);
        console.log(`🌐 Connection from: ${socket.handshake.address}`);
        console.log(`🍪 Cookies: ${socket.handshake.headers.cookie}`);
        try {
            const cookieHeader = socket.handshake.headers.cookie;
            const cookies = parseCookies(cookieHeader);
            // Get token from cookies
            const token = cookies.token;
            if (!token) {
                console.log("❌ No token, disconnecting socket");
                socket.disconnect();
                return;
            }
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is not defined");
            }
            // Verify JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Get user from database to ensure they still exist
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                },
            });
            if (!user) {
                console.log("❌ User not found, disconnecting socket");
                socket.disconnect();
                return;
            }
            // Attach user data to socket for later use
            socket.user = user;
            // Map userId to socketId
            userSocketMap.set(user.id, socket.id);
            // Update user online status
            await prisma.user.update({
                where: { id: user.id },
                data: { isOnline: true, lastSeen: new Date() },
            });
            // 🚀 EMIT ONLINE USERS UPDATES (with delay to avoid race conditions)
            setTimeout(() => {
                console.log(`⏰ Starting to emit events for ${user.fullName}...`);
                // 1. Send current online users to the newly connected user
                const onlineUsers = getOnlineUsers().map((userId) => ({
                    userId,
                    socketId: getUserSocketId(userId),
                    isOnline: true,
                }));
                socket.emit("users_online", onlineUsers);
                // 2. Notify all OTHER users that someone joined
                const joinedData = {
                    userId: user.id,
                    socketId: socket.id,
                    userInfo: {
                        id: user.id,
                        username: user.username,
                        fullName: user.fullName,
                        profilePic: null, // Add profilePic if available
                    },
                };
                console.log(`📤 About to broadcast 'user_joined' for ${user.fullName}`);
                console.log(`� User joined data:`, JSON.stringify(joinedData, null, 2));
                socket.broadcast.emit("user_joined", joinedData);
                console.log(`✅ Broadcasted 'user_joined' event for ${user.fullName}`);
            }, 1000); // 1 second delay to ensure frontend is ready
            socket.on("message", (data) => {
                if (socket.user) {
                    console.log(`📩 From ${socket.user.fullName} (${socket.user.id}):`, data);
                }
            });
            socket.on("disconnect", async () => {
                if (socket.user) {
                    console.log(`👋 User ${socket.user.fullName} (${socket.user.id}) disconnected from socket ${socket.id}`);
                    // Remove user from socket mapping
                    userSocketMap.delete(socket.user.id);
                    console.log(`📊 Online users: ${getOnlineUsers().length}`);
                    // Update user offline status
                    await prisma.user.update({
                        where: { id: socket.user.id },
                        data: { isOnline: false, lastSeen: new Date() },
                    });
                    // 🚀 EMIT USER LEFT UPDATE
                    // Notify all OTHER users that someone left
                    socket.broadcast.emit("user_left", {
                        userId: socket.user.id,
                    });
                    console.log(`📢 Broadcasted user_left event for ${socket.user.fullName}`);
                }
            });
        }
        catch (err) {
            console.error("❌ Socket auth error:", err?.message || err);
            socket.disconnect();
        }
    });
}
export { createSocket };
//# sourceMappingURL=index.js.map