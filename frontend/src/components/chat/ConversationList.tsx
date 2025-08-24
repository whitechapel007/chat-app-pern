import { useSocket } from "../../hooks/useSocket";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import type { Conversation } from "../../types/chat";
import { formatDistanceToNow } from "../../utils/dateUtils";

interface ConversationListProps {
  onConversationSelect?: () => void;
}

const ConversationList = ({ onConversationSelect }: ConversationListProps) => {
  const { user } = useAuthStore();
  const {
    conversations: rawConversations,
    selectedConversationId,
    selectConversation,
    searchQuery,
  } = useChatStore();

  const { isUserOnline } = useSocket();

  // Ensure conversations is always an array
  const conversations = Array.isArray(rawConversations) ? rawConversations : [];

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === "GROUP") {
      return conversation.name || "Group Chat";
    }

    // Ensure we have a valid user and participants array
    if (!user?.id || !Array.isArray(conversation.participants)) {
      return "Unknown User";
    }

    // For direct messages, show the other participant's name
    const otherParticipant = conversation.participants.find(
      (p) => p && p.userId && p.userId !== user.id
    );

    return otherParticipant?.user?.fullName || "Unknown User";
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === "GROUP") {
      return null; // We'll show a group icon
    }

    // Ensure we have a valid user and participants array
    if (!user?.id || !Array.isArray(conversation.participants)) {
      return null;
    }

    const otherParticipant = conversation.participants.find(
      (p) => p && p.userId && p.userId !== user.id
    );
    return otherParticipant?.user?.profilePic || null;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOnline = (conversation: Conversation) => {
    // Group conversations don't show online status
    if (conversation.type === "GROUP") return false;

    // Ensure we have a valid user and participants array
    if (!user?.id || !Array.isArray(conversation.participants)) return false;

    // Find the other participant in the direct conversation
    const otherParticipant = conversation.participants.find(
      (p) => p && p.userId && p.userId !== user.id
    );

    // Use real-time socket data to check if the other user is online
    if (!otherParticipant?.userId) return false;

    try {
      return isUserOnline(otherParticipant.userId);
    } catch (error) {
      console.warn("Error checking user online status:", error);
      return false;
    }
  };

  const formatLastMessageTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString));
    } catch {
      return "";
    }
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    // Check if conversation has messages and the first message exists
    if (
      !conversation.messages ||
      !Array.isArray(conversation.messages) ||
      !conversation.messages[0]
    ) {
      return "No messages yet";
    }

    const lastMessage = conversation.messages[0];
    const { content, type, senderId } = lastMessage;

    // Safely check if the message is from the current user
    const isFromMe = senderId === user?.id;
    const prefix = isFromMe ? "You: " : "";

    // Handle different message types
    switch (type) {
      case "IMAGE":
        return `${prefix}📷 Image`;
      case "FILE":
        return `${prefix}📎 File`;
      case "SYSTEM":
        return content || "System message";
      default:
        return `${prefix}${content || "Message"}`;
    }
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery || !searchQuery.trim()) return true;

    try {
      const name = getConversationName(conversation).toLowerCase();
      const lastMessage =
        conversation.messages?.[0]?.content?.toLowerCase() || "";
      const query = searchQuery.toLowerCase().trim();

      return name.includes(query) || lastMessage.includes(query);
    } catch (error) {
      console.warn("Error filtering conversation:", error);
      return true; // Include conversation if there's an error
    }
  });

  const handleConversationClick = (conversationId: string) => {
    selectConversation(conversationId);
    onConversationSelect?.();
  };

  if (filteredConversations.length === 0) {
    return (
      <div className="p-4 text-center text-base-content/50">
        {searchQuery ? "No conversations found" : "No conversations yet"}
      </div>
    );
  }

  return (
    <div className="space-y-1 px-2 pb-4">
      {filteredConversations.map((conversation) => {
        const isSelected = conversation.id === selectedConversationId;
        const conversationName = getConversationName(conversation);
        const avatarUrl = getConversationAvatar(conversation);
        const userIsOnline = isOnline(conversation);

        return (
          <div
            key={conversation.id}
            className={`
              p-3 rounded-lg cursor-pointer transition-colors duration-200
              ${
                isSelected
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200"
              }
            `}
            onClick={() => handleConversationClick(conversation.id)}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={conversationName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold">
                        {conversation.type === "GROUP"
                          ? "👥"
                          : getInitials(conversationName)}
                      </span>
                    )}
                  </div>
                </div>
                {userIsOnline && conversation.type === "DIRECT" && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">{conversationName}</h3>
                  {conversation.messages[0] && (
                    <span
                      className={`
                      text-xs flex-shrink-0 ml-2
                      ${
                        isSelected
                          ? "text-primary-content/70"
                          : "text-base-content/50"
                      }
                    `}
                    >
                      {formatLastMessageTime(
                        conversation.messages[0].createdAt
                      )}
                    </span>
                  )}
                </div>
                <p
                  className={`
                  text-sm truncate
                  ${
                    isSelected
                      ? "text-primary-content/70"
                      : "text-base-content/70"
                  }
                `}
                >
                  {getLastMessagePreview(conversation)}
                </p>
              </div>

              {/* Unread indicator */}
              {conversation.unreadCount && conversation.unreadCount > 0 && (
                <div className="badge badge-error badge-sm flex-shrink-0">
                  {conversation.unreadCount > 99
                    ? "99+"
                    : conversation.unreadCount}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
