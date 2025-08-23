import { Info, Phone, Video } from "lucide-react";
import React from "react";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

interface ChatAreaProps {
  onToggleRightSidebar?: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ onToggleRightSidebar }) => {
  const { user } = useAuthStore();
  const {
    selectedConversationId,
    conversations: rawConversations,
    isLoadingMessages,
  } = useChatStore();

  // Ensure conversations is always an array
  const conversations = Array.isArray(rawConversations) ? rawConversations : [];

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  );

  const getConversationName = () => {
    if (!selectedConversation) return "";

    if (selectedConversation.type === "GROUP") {
      return selectedConversation.name || "Group Chat";
    }

    // For direct messages, show the other participant's name
    const otherParticipant = selectedConversation.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user.fullName || "Unknown User";
  };

  const getConversationAvatar = () => {
    if (!selectedConversation) return null;

    if (selectedConversation.type === "GROUP") {
      return null; // We'll show a group icon
    }

    const otherParticipant = selectedConversation.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user.profilePic;
  };

  const isOnline = () => {
    if (!selectedConversation || selectedConversation.type === "GROUP") {
      return false;
    }

    const otherParticipant = selectedConversation.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user.isOnline || false;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!selectedConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base-100">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold text-base-content mb-2">
            Welcome to Chat
          </h2>
          <p className="text-base-content/70">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  const conversationName = getConversationName();
  const avatarUrl = getConversationAvatar();
  const userIsOnline = isOnline();

  return (
    <div className="flex-1 flex flex-col bg-base-100">
      {/* Chat Header */}
      <div className="p-4 border-b border-base-300 bg-base-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={conversationName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold">
                      {selectedConversation?.type === "GROUP"
                        ? "👥"
                        : getInitials(conversationName)}
                    </span>
                  )}
                </div>
              </div>
              {userIsOnline && selectedConversation?.type === "DIRECT" && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
              )}
            </div>

            {/* Name and Status */}
            <div>
              <h3 className="font-semibold text-base-content">
                {conversationName}
              </h3>
              {selectedConversation?.type === "DIRECT" && (
                <p className="text-sm text-base-content/70">
                  {userIsOnline ? "Online" : "Offline"}
                </p>
              )}
              {selectedConversation?.type === "GROUP" && (
                <p className="text-sm text-base-content/70">
                  {selectedConversation.participants.length} members
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button className="btn btn-ghost btn-circle btn-sm">
              <Phone size={16} />
            </button>
            <button className="btn btn-ghost btn-circle btn-sm">
              <Video size={16} />
            </button>
            <button
              className="btn btn-ghost btn-circle btn-sm"
              onClick={onToggleRightSidebar}
            >
              <Info size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {isLoadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : (
          <MessageList />
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-base-300 bg-base-100">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatArea;
