import { apiClient } from "../lib/api";
import type {
  Conversation,
  CreateConversationData,
  Message,
  OnlineUser,
  SendMessageData,
} from "../types/chat";

export const chatAPI = {
  // Get all conversations for the authenticated user
  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get("/messages/conversations");
    return response.data;
  },

  // Get messages for a specific conversation
  getMessages: async (
    conversationId: string,
    options?: {
      page?: number;
      limit?: number;
      before?: string;
      after?: string;
    }
  ): Promise<Message[]> => {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.before) params.append("before", options.before);
    if (options?.after) params.append("after", options.after);

    const response = await apiClient.get(
      `/messages/conversations/${conversationId}/messages?${params.toString()}`
    );
    return response.data;
  },

  // Send a message to a conversation
  sendMessage: async (
    conversationId: string,
    data: SendMessageData
  ): Promise<Message> => {
    const response = await apiClient.post(
      `/messages/conversations/${conversationId}/messages`,
      data
    );
    return response.data;
  },

  // Send a direct message to a user (creates conversation if needed)
  sendDirectMessage: async (
    userId: string,
    data: SendMessageData
  ): Promise<{ message: Message; conversation: Conversation }> => {
    const response = await apiClient.post(
      `/messages/users/${userId}/messages`,
      data
    );
    return response.data.data;
  },

  // Create a group conversation
  createGroupConversation: async (
    data: CreateConversationData
  ): Promise<Conversation> => {
    const response = await apiClient.post("/messages/conversations", data);
    return response.data;
  },

  // Update a message
  updateMessage: async (
    messageId: string,
    data: { content: string }
  ): Promise<Message> => {
    const response = await apiClient.put(`/messages/${messageId}`, data);
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId: string): Promise<void> => {
    await apiClient.delete(`/messages/${messageId}`);
  },

  // Get online users (mock for now - would be WebSocket in real app)
  getOnlineUsers: async (): Promise<OnlineUser[]> => {
    // This would typically come from WebSocket or a separate endpoint
    // For now, we'll return an empty array and populate it later
    return [];
  },

  // Get all users for starting new conversations
  getUsers: async (): Promise<OnlineUser[]> => {
    try {
      const response = await apiClient.get("/users");
      return response.data.data.users;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return [];
    }
  },

  // Upload image message
  uploadImage: async (conversationId: string, file: File): Promise<Message> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post(
      `/messages/conversations/${conversationId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Upload image to user (direct message)
  uploadImageToUser: async (userId: string, file: File): Promise<Message> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post(
      `/messages/users/${userId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
