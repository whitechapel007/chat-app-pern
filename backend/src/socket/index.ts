import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";
import type { JWTPayload } from "../middleware/auth.middleware";

// Extend Socket interface to include user data
declare module "socket.io" {
  interface Socket {
    user?: {
      id: string;
      username: string;
      email: string;
      fullName: string;
    };
  }
}

// Global map to store userId -> socketId mapping
const userSocketMap = new Map<string, string>();

// Helper functions for user-socket mapping
export const getUserSocketId = (userId: string): string | undefined => {
  return userSocketMap.get(userId);
};

export const getOnlineUsers = (): string[] => {
  return Array.from(userSocketMap.keys());
};

export const isUserOnline = (userId: string): boolean => {
  return userSocketMap.has(userId);
};

function createSocket(io: Server) {
  // helper function to parse cookies
  function parseCookies(
    cookieHeader: string | undefined
  ): Record<string, string> {
    if (!cookieHeader) return {};

    return cookieHeader
      .split(";")
      .reduce((acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split("=");
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      }, {});
  }

  io.on("connection", async (socket: Socket) => {
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

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

      console.log(`✅ User ${user.fullName} (${user.id}) connected via socket`);

      // Update user online status
      await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true, lastSeen: new Date() },
      });

      socket.on("message", (data) => {
        if (socket.user) {
          console.log(
            `📩 From ${socket.user.fullName} (${socket.user.id}):`,
            data
          );
        }
      });

      socket.on("disconnect", async () => {
        if (socket.user) {
          console.log(
            `👋 User ${socket.user.fullName} (${socket.user.id}) disconnected`
          );

          // Update user offline status
          await prisma.user.update({
            where: { id: socket.user.id },
            data: { isOnline: false, lastSeen: new Date() },
          });
        }
      });
    } catch (err: any) {
      console.error("❌ Socket auth error:", err?.message || err);
      socket.disconnect();
    }
  });
}

export { createSocket };
