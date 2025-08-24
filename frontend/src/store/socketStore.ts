import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import type { Conversation, Message } from "../types/chat";

interface OnlineUser {
  userId: string;
  socketId: string;
  isOnline: boolean;
}

interface TypingUser {
  userId: string;
  conversationId: string;
  userInfo: {
    id: string;
    fullName: string;
    username: string;
  };
}

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  reconnectAttempts: number;
  lastError: string | null;
}

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  profilePic: string;
}

interface SocketActions {
  connect: (userId: string) => void;
  disconnect: () => void;
  sendMessage: (event: string, data: unknown) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  setOnlineUsers: (users: OnlineUser[]) => void;
  addOnlineUser: (user: OnlineUser) => void;
  removeOnlineUser: (userId: string) => void;
  isUserOnline: (userId: string) => boolean;
  getUserSocketId: (userId: string) => string | undefined;
  // Typing actions
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  setUserTyping: (typingUser: TypingUser) => void;
  removeUserTyping: (userId: string, conversationId: string) => void;
  getTypingUsers: (conversationId: string) => TypingUser[];
  reset: () => void;
}

type SocketStore = SocketState & SocketActions;

const initialState: SocketState = {
  socket: null,
  isConnected: false,
  onlineUsers: [],
  typingUsers: [],
  connectionStatus: "disconnected",
  reconnectAttempts: 0,
  lastError: null,
};

const MAX_RECONNECT_ATTEMPTS = 5;

export const useSocketStore = create<SocketStore>((set, get) => ({
  ...initialState,

  connect: (userId: string) => {
    const { socket: existingSocket } = get();

    // Disconnect existing socket if any
    if (existingSocket) {
      existingSocket.disconnect();
    }

    set({ connectionStatus: "connecting", lastError: null });

    // Create new socket connection
    const socket = io(
      import.meta.env.VITE_API_URL?.replace("/api", "") || "/",
      {
        withCredentials: true,
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
      }
    );

    // Connection event handlers
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      console.log("🔌 Socket connected for userId:", userId);
      console.log("🎧 Setting up event listeners...");
      set({
        isConnected: true,
        connectionStatus: "connected",
        reconnectAttempts: 0,
        lastError: null,
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      set({
        isConnected: false,
        connectionStatus: "disconnected",
        onlineUsers: [],
      });
    });

    socket.on("connect_error", (error) => {
      console.error("🔥 Socket connection error:", error);
      const { reconnectAttempts } = get();

      set({
        isConnected: false,
        connectionStatus: "error",
        lastError: error.message,
      });

      // Implement exponential backoff for reconnection
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.pow(2, reconnectAttempts) * 1000;
        console.log(
          `🔄 Retrying connection in ${delay}ms (attempt ${
            reconnectAttempts + 1
          }/${MAX_RECONNECT_ATTEMPTS})`
        );

        setTimeout(() => {
          set({ reconnectAttempts: reconnectAttempts + 1 });
          socket.connect();
        }, delay);
      } else {
        console.error("❌ Max reconnection attempts reached");
        set({ connectionStatus: "error" });
      }
    });

    // Real-time message handlers
    socket.on(
      "new_message",
      (data: {
        message: Message;
        conversation: Conversation;
        sender: User;
      }) => {
        console.log("📨 Received new message:", data);

        // Import chat store dynamically to avoid circular dependency
        import("./chatStore")
          .then(({ useChatStore }) => {
            try {
              const { addMessage, selectedConversationId } =
                useChatStore.getState();

              if (data.message && data.message.conversationId) {
                addMessage(data.message.conversationId, data.message);

                // Show notification if not in the conversation
                if (selectedConversationId !== data.message.conversationId) {
                  showNotification(data.message, data.sender);
                }

                // Update the conversation's last message without reloading all conversations
                useChatStore.setState((state) => ({
                  conversations: Array.isArray(state.conversations)
                    ? state.conversations.map((conv) =>
                        conv.id === data.message.conversationId
                          ? {
                              ...conv,
                              lastMessage: data.message,
                              updatedAt: data.message.createdAt,
                            }
                          : conv
                      )
                    : state.conversations,
                }));
              }
            } catch (error) {
              console.error("Error handling new message:", error);
            }
          })
          .catch((error) => {
            console.error("Error importing chat store:", error);
          });
      }
    );

    // Online users updates
    socket.on("users_online", (users: OnlineUser[]) => {
      set({ onlineUsers: users });
      console.log("✅ Updated socketStore onlineUsers state");
    });

    // User joined/left notifications
    socket.on(
      "user_joined",
      (userData: { userId: string; socketId: string }) => {
        console.log("👋 User joined:", userData);
        get().addOnlineUser({
          userId: userData.userId,
          socketId: userData.socketId,
          isOnline: true,
        });
      }
    );

    socket.on("user_left", (userData: { userId: string }) => {
      console.log("👋 User left:", userData);
      get().removeOnlineUser(userData.userId);
    });

    // Conversation events
    socket.on(
      "conversation_created",
      (data: { conversation: Conversation; creator: User }) => {
        console.log("🆕 New conversation created:", data);

        // Import chat store dynamically to avoid circular dependency
        import("./chatStore")
          .then(({ useChatStore }) => {
            try {
              const { addConversation } = useChatStore.getState();

              // Add the new conversation to the list
              addConversation(data.conversation);

              // Show notification
              if (Notification.permission === "granted") {
                new Notification(
                  `New conversation: ${data.conversation.name || "Group Chat"}`,
                  {
                    body: `Created by ${data.creator?.fullName || "Someone"}`,
                    icon: data.creator?.profilePic || "/default-avatar.png",
                  }
                );
              }
            } catch (error) {
              console.error("Error handling conversation created:", error);
            }
          })
          .catch((error) => {
            console.error("Error importing chat store:", error);
          });
      }
    );

    socket.on(
      "conversation_updated",
      (data: { conversation: Conversation }) => {
        console.log("📝 Conversation updated:", data);

        // Import chat store dynamically to avoid circular dependency
        import("./chatStore")
          .then(({ useChatStore }) => {
            try {
              const { updateConversation } = useChatStore.getState();

              // Update the conversation in the list
              updateConversation(data.conversation);
            } catch (error) {
              console.error("Error handling conversation updated:", error);
            }
          })
          .catch((error) => {
            console.error("Error importing chat store:", error);
          });
      }
    );

    // Typing indicators
    socket.on(
      "user_typing",
      (data: {
        userId: string;
        conversationId: string;
        isTyping: boolean;
        userInfo: {
          id: string;
          fullName: string;
          username: string;
        };
      }) => {
        console.log("⌨️ User typing:", data);

        if (data.isTyping) {
          // User started typing
          get().setUserTyping({
            userId: data.userId,
            conversationId: data.conversationId,
            userInfo: data.userInfo,
          });
        } else {
          // User stopped typing
          get().removeUserTyping(data.userId, data.conversationId);
        }
      }
    );

    // 🧪 Test event listener
    socket.on("test_event", (data: unknown) => {
      console.log("🧪 TEST EVENT RECEIVED:", data);
      console.log("✅ Socket is definitely receiving events!");
    });

    // 🔍 Debug: Listen for ALL events
    socket.onAny((eventName: string, ...args: unknown[]) => {
      console.log(`🔍 RECEIVED EVENT: ${eventName}`, args);
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      console.log("🔌 Disconnecting socket");
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        connectionStatus: "disconnected",
        onlineUsers: [],
        reconnectAttempts: 0,
        lastError: null,
      });
    }
  },

  sendMessage: (event: string, data: unknown) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn("⚠️ Cannot send message - socket not connected");
    }
  },

  joinRoom: (roomId: string) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit("join_room", roomId);
      console.log(`🏠 Joined room: ${roomId}`);
    }
  },

  leaveRoom: (roomId: string) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit("leave_room", roomId);
      console.log(`🚪 Left room: ${roomId}`);
    }
  },

  setOnlineUsers: (users: OnlineUser[]) => {
    set({ onlineUsers: users });
  },

  addOnlineUser: (user: OnlineUser) => {
    set((state) => ({
      onlineUsers: [
        ...state.onlineUsers.filter((u) => u.userId !== user.userId),
        user,
      ],
    }));
  },

  removeOnlineUser: (userId: string) => {
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((u) => u.userId !== userId),
    }));
  },

  isUserOnline: (userId: string) => {
    const { onlineUsers } = get();
    return onlineUsers.some((user) => user.userId === userId && user.isOnline);
  },

  getUserSocketId: (userId: string) => {
    const { onlineUsers } = get();
    return onlineUsers.find((user) => user.userId === userId)?.socketId;
  },

  // Typing actions
  startTyping: (conversationId: string) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit("typing_start", { conversationId });
    }
  },

  stopTyping: (conversationId: string) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit("typing_stop", { conversationId });
    }
  },

  setUserTyping: (typingUser: TypingUser) => {
    const { typingUsers } = get();
    const existingIndex = typingUsers.findIndex(
      (user) =>
        user.userId === typingUser.userId &&
        user.conversationId === typingUser.conversationId
    );

    if (existingIndex >= 0) {
      // Update existing typing user
      const updatedTypingUsers = [...typingUsers];
      updatedTypingUsers[existingIndex] = typingUser;
      set({ typingUsers: updatedTypingUsers });
    } else {
      // Add new typing user
      set({ typingUsers: [...typingUsers, typingUser] });
    }
  },

  removeUserTyping: (userId: string, conversationId: string) => {
    const { typingUsers } = get();
    const filteredTypingUsers = typingUsers.filter(
      (user) =>
        !(user.userId === userId && user.conversationId === conversationId)
    );
    set({ typingUsers: filteredTypingUsers });
  },

  getTypingUsers: (conversationId: string) => {
    const { typingUsers } = get();
    return typingUsers.filter((user) => user.conversationId === conversationId);
  },

  reset: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set(initialState);
  },
}));

// Helper function to show browser notifications
const showNotification = (message: Message, sender: User) => {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(
      `New message from ${sender?.fullName || "Someone"}`,
      {
        body: message.type === "TEXT" ? message.content : "Sent an image",
        icon: sender?.profilePic || "/default-avatar.png",
        tag: message.conversationId, // Prevent duplicate notifications
      }
    );

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        showNotification(message, sender);
      }
    });
  }
};
