import { create } from "zustand";
import { chatAPI } from "../services/chat";
import type {
  ChatState,
  Conversation,
  CreateConversationData,
  Message,
  SendMessageData,
} from "../types/chat";

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

  // Group chats
  createGroupConversation: (
    data: CreateConversationData
  ) => Promise<Conversation>;

  // File uploads
  uploadImage: (conversationId: string, file: File) => Promise<void>;
  uploadImageToUser: (userId: string, file: File) => Promise<void>;

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
      const { messages } = await chatAPI.getMessages(conversationId, {
        limit: 50,
      });

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages, // Reverse to show oldest first
        },
        isLoadingMessages: false,
      }));
    } catch (error) {
      console.error("Failed to load messages:", error);
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
      const { message, conversationId, conversation } = result;

      // Add or update conversation
      set((state) => {
        // Ensure conversations is always an array
        const conversations = Array.isArray(state.conversations)
          ? state.conversations
          : [];

        const existingConvIndex = conversations.findIndex(
          (conv) => conv.id === conversationId
        );

        let updatedConversations;
        if (existingConvIndex >= 0) {
          // Update existing conversation
          updatedConversations = conversations.map((conv, index) =>
            index === existingConvIndex
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updatedAt: message.createdAt,
                }
              : conv
          );
        } else {
          // Add new conversation to the list
          updatedConversations = [
            { ...conversation, messages: [message] },
            ...conversations,
          ];
        }

        return {
          conversations: updatedConversations,
          messages: {
            ...state.messages,
            [conversationId]: [
              ...(state.messages[conversationId] || []),
              message,
            ],
          },
          selectedConversationId: conversationId,
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

  // File upload actions
  uploadImage: async (conversationId, file) => {
    set({ isSendingMessage: true, error: null });
    try {
      const message = await chatAPI.uploadImage(conversationId, file);

      // Add the message to the store
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
    } catch (error) {
      console.error("Failed to upload image:", error);
      set({
        error: "Failed to upload image",
        isSendingMessage: false,
      });
      throw error;
    }
  },

  uploadImageToUser: async (userId, file) => {
    set({ isSendingMessage: true, error: null });
    try {
      const message = await chatAPI.uploadImageToUser(userId, file);

      // Add the message to the store
      set((state) => ({
        messages: {
          ...state.messages,
          [message.conversationId]: [
            ...(state.messages[message.conversationId] || []),
            message,
          ],
        },
        selectedConversationId: message.conversationId,
        isSendingMessage: false,
      }));

      // Reload conversations to get the updated conversation
      get().loadConversations();
    } catch (error) {
      console.error("Failed to upload image to user:", error);
      set({
        error: "Failed to upload image",
        isSendingMessage: false,
      });
      throw error;
    }
  },

  // Group chat actions
  createGroupConversation: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const conversation = await chatAPI.createGroupConversation(data);

      const conversations = await chatAPI.getConversations();

      set(() => ({
        conversations: [...conversations],
        selectedConversationId: conversation.id,
        isLoading: false,
      }));

      // Load messages for the new conversation
      get().loadMessages(conversation.id);

      return conversation;
    } catch (error) {
      console.error("Failed to create group conversation:", error);
      set({
        error: "Failed to create group chat",
        isLoading: false,
      });
      throw error;
    }
  },

  reset: () => {
    set(initialState);
  },
}));
