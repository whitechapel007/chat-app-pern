export interface Message {
  id: string;
  content: string;
  type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  senderId: string;
  conversationId: string;
  createdAt: string;
  updatedAt?: string;
  sender?: {
    id: string;
    fullName: string;
    username: string;
    profilePic?: string;
  };
}

export interface Conversation {
  id: string;
  type: "DIRECT" | "GROUP";
  name?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  participants: ConversationParticipant[];
  unreadCount?: number;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  role: "MEMBER" | "ADMIN";
  joinedAt: string;
  lastReadAt?: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    profilePic?: string;
    isOnline: boolean;
  };
}

export interface OnlineUser {
  id: string;
  fullName: string;
  username: string;
  profilePic?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages
  selectedConversationId: string | null;
  onlineUsers: OnlineUser[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  error: string | null;
  searchQuery: string;
  selectedUserId: string | null; // for right sidebar
}

export interface SendMessageData {
  content: string;
  type?: "TEXT" | "IMAGE" | "FILE";
}

export interface CreateConversationData {
  type: "DIRECT" | "GROUP";
  name?: string;
  description?: string;
  participantIds: string[];
}
