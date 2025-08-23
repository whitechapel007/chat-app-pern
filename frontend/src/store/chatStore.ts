import { create } from "zustand";
import { chatAPI } from "../services/chat";
import type { ChatState, Message, SendMessageData } from "../types/chat";

interface ChatActions {
  // Conversations
  loadConversations: () => Promise<void>;
  selectConversation: (conversationId: string | null) => void;

  // Messages
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, data: SendMessageData) => Promise<void>;
  sendDirectMessage: (userId: string, data: SendMessageData) => Promise<void>;
  addMessage: (message: Message) => void;

  // Users
  loadOnlineUsers: () => Promise<void>;
  selectUser: (userId: string | null) => void;

  // UI State
  setSearchQuery: (query: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Utility
  reset: () => void;
}

type ChatStore = ChatState & ChatActions;

const initialState: ChatState = {
  conversations: [],
  messages: {},
  selectedConversationId: null,
  onlineUsers: [],
  isLoading: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,
  searchQuery: "",
  selectedUserId: null,
};

export const useChatStore = create<ChatStore>((set, get) => ({
  // State
  ...initialState,

  // Actions
  loadConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const conversations = await chatAPI.getConversations();
      set({ conversations, isLoading: false });
    } catch (error) {
      console.error("Failed to load conversations:", error);

      // For demo purposes, add some mock conversations
      const mockConversations = [
        {
          id: "1",
          type: "DIRECT" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          participants: [
            {
              id: "p1",
              conversationId: "1",
              userId: "user1",
              role: "MEMBER" as const,
              joinedAt: new Date().toISOString(),
              user: {
                id: "user1",
                fullName: "Dina Harrison",
                username: "dina_harrison",
                email: "dina@example.com",
                isOnline: true,
              },
            },
          ],
          lastMessage: {
            id: "m1",
            content: "Hey Travis, would U like to drink some coffe with me?",
            type: "TEXT" as const,
            senderId: "user1",
            conversationId: "1",
            createdAt: new Date(Date.now() - 300000).toISOString(),
            sender: {
              id: "user1",
              fullName: "Dina Harrison",
              username: "dina_harrison",
            },
          },
        },
        {
          id: "2",
          type: "DIRECT" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          participants: [
            {
              id: "p2",
              conversationId: "2",
              userId: "user2",
              role: "MEMBER" as const,
              joinedAt: new Date().toISOString(),
              user: {
                id: "user2",
                fullName: "John Shinoda",
                username: "john_shinoda",
                email: "john@example.com",
                isOnline: false,
              },
            },
          ],
          lastMessage: {
            id: "m2",
            content: "Hey man, how R U???",
            type: "TEXT" as const,
            senderId: "user2",
            conversationId: "2",
            createdAt: new Date(Date.now() - 600000).toISOString(),
            sender: {
              id: "user2",
              fullName: "John Shinoda",
              username: "john_shinoda",
            },
          },
        },
      ];

      set({
        conversations: mockConversations,
        onlineUsers: [
          {
            id: "user1",
            fullName: "Dina Harrison",
            username: "dina_harrison",
            isOnline: true,
          },
          {
            id: "user3",
            fullName: "Sam Pettersen",
            username: "sam_pettersen",
            isOnline: true,
          },
        ],
        isLoading: false,
      });
    }
  },

  selectConversation: (conversationId) => {
    set({ selectedConversationId: conversationId });
    if (conversationId) {
      get().loadMessages(conversationId);
    }
  },

  loadMessages: async (conversationId) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const messages = await chatAPI.getMessages(conversationId, { limit: 50 });
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages.reverse(), // Reverse to show oldest first
        },
        isLoadingMessages: false,
      }));
    } catch (error) {
      console.error("Failed to load messages:", error);

      // For demo purposes, add some mock messages
      const mockMessages =
        conversationId === "1"
          ? [
              {
                id: "m1",
                content:
                  "Hey Travis, would U like to drink some coffe with me?",
                type: "TEXT" as const,
                senderId: "user1",
                conversationId: "1",
                createdAt: new Date(Date.now() - 300000).toISOString(),
                sender: {
                  id: "user1",
                  fullName: "Dina Harrison",
                  username: "dina_harrison",
                },
              },
              {
                id: "m3",
                content: "Sure! At 11:00 am?",
                type: "TEXT" as const,
                senderId: "current-user",
                conversationId: "1",
                createdAt: new Date(Date.now() - 240000).toISOString(),
                sender: {
                  id: "current-user",
                  fullName: "Travis Taylor",
                  username: "travis_taylor",
                },
              },
              {
                id: "m4",
                content:
                  "Yay! I have a tons stories about that man.. Ok, have a nice evening, see ya!",
                type: "TEXT" as const,
                senderId: "user1",
                conversationId: "1",
                createdAt: new Date(Date.now() - 180000).toISOString(),
                sender: {
                  id: "user1",
                  fullName: "Dina Harrison",
                  username: "dina_harrison",
                },
              },
              {
                id: "m5",
                content: "See ya 😊",
                type: "TEXT" as const,
                senderId: "current-user",
                conversationId: "1",
                createdAt: new Date(Date.now() - 120000).toISOString(),
                sender: {
                  id: "current-user",
                  fullName: "Travis Taylor",
                  username: "travis_taylor",
                },
              },
            ]
          : [
              {
                id: "m2",
                content: "Hey man, how R U???",
                type: "TEXT" as const,
                senderId: "user2",
                conversationId: "2",
                createdAt: new Date(Date.now() - 600000).toISOString(),
                sender: {
                  id: "user2",
                  fullName: "John Shinoda",
                  username: "john_shinoda",
                },
              },
            ];

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: mockMessages,
        },
        isLoadingMessages: false,
      }));
    }
  },

  sendMessage: async (conversationId, data) => {
    set({ isSendingMessage: true, error: null });
    try {
      const message = await chatAPI.sendMessage(conversationId, data);

      // Add message to local state
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: [
            ...(state.messages[conversationId] || []),
            message,
          ],
        },
        isSendingMessage: false,
      }));

      // Update conversation's last message
      set((state) => ({
        conversations: Array.isArray(state.conversations)
          ? state.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    lastMessage: message,
                    updatedAt: message.createdAt,
                  }
                : conv
            )
          : [],
      }));
    } catch (error) {
      console.error("Failed to send message:", error);
      set({
        error: "Failed to send message",
        isSendingMessage: false,
      });
    }
  },

  sendDirectMessage: async (userId, data) => {
    set({ isSendingMessage: true, error: null });
    try {
      const result = await chatAPI.sendDirectMessage(userId, data);
      const { message, conversation } = result;

      // Add or update conversation
      set((state) => {
        // Ensure conversations is always an array
        const conversations = Array.isArray(state.conversations)
          ? state.conversations
          : [];

        const existingConvIndex = conversations.findIndex(
          (conv) => conv.id === conversation.id
        );

        let updatedConversations;
        if (existingConvIndex >= 0) {
          updatedConversations = conversations.map((conv, index) =>
            index === existingConvIndex
              ? { ...conv, lastMessage: message }
              : conv
          );
        } else {
          updatedConversations = [
            { ...conversation, lastMessage: message },
            ...conversations,
          ];
        }

        return {
          conversations: updatedConversations,
          messages: {
            ...state.messages,
            [conversation.id]: [
              ...(state.messages[conversation.id] || []),
              message,
            ],
          },
          selectedConversationId: conversation.id,
          isSendingMessage: false,
        };
      });
    } catch (error) {
      console.error("Failed to send direct message:", error);
      set({
        error: "Failed to send message",
        isSendingMessage: false,
      });
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [message.conversationId]: [
          ...(state.messages[message.conversationId] || []),
          message,
        ],
      },
    }));
  },

  loadOnlineUsers: async () => {
    try {
      const onlineUsers = await chatAPI.getOnlineUsers();
      set({ onlineUsers });
    } catch (error) {
      console.error("Failed to load online users:", error);
    }
  },

  selectUser: (userId) => {
    set({ selectedUserId: userId });
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));
