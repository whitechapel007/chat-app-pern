import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useSocketStore } from "../store/socketStore";

export const useSocket = () => {
  const {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    connectionStatus,
    lastError,
    connect,
    disconnect,
    sendMessage,
    joinRoom,
    leaveRoom,
    isUserOnline,
    getUserSocketId,
    startTyping,
    stopTyping,
    getTypingUsers,
  } = useSocketStore();

  const { user, isAuthenticated } = useAuthStore();

  console.log(onlineUsers);
  // Auto-connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !socket) {
      console.log("🔌 Auto-connecting socket for user:", user.id);
      connect(user.id);
    } else if (!isAuthenticated && socket) {
      console.log("🔌 Auto-disconnecting socket - user not authenticated");
      disconnect();
    }
  }, [isAuthenticated, user, socket, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't disconnect on unmount as we want to keep the connection
      // across component re-renders. Only disconnect on logout.
    };
  }, []);

  return {
    // Connection state
    socket,
    isConnected,
    connectionStatus,
    lastError,

    // Online users
    onlineUsers,
    isUserOnline,
    getUserSocketId,

    // Typing users
    typingUsers,
    getTypingUsers,

    // Actions
    sendMessage,
    joinRoom,
    leaveRoom,
    connect,
    disconnect,
    startTyping,
    stopTyping,

    // Computed values
    onlineUserCount: onlineUsers.length,
    isConnecting: connectionStatus === "connecting",
    hasError: connectionStatus === "error",
  };
};
