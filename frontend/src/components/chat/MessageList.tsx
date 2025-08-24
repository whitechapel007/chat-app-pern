import { useEffect, useMemo, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import type { Message } from "../../types/chat";
import { formatMessageTime } from "../../utils/dateUtils";

const MessageList = () => {
  const { user } = useAuthStore();
  const { selectedConversationId, messages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationMessages = useMemo(() => {
    return selectedConversationId ? messages[selectedConversationId] || [] : [];
  }, [selectedConversationId, messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderMessage = (message: Message, index: number) => {
    const isFromMe = message.senderId === user?.id;
    const prevMessage = index > 0 ? conversationMessages[index - 1] : null;
    const nextMessage =
      index < conversationMessages.length - 1
        ? conversationMessages[index + 1]
        : null;

    // Check if we should show the avatar (first message from this sender in a group)
    const showAvatar =
      !isFromMe &&
      (!prevMessage ||
        prevMessage.senderId !== message.senderId ||
        new Date(message.createdAt).getTime() -
          new Date(prevMessage.createdAt).getTime() >
          300000); // 5 minutes

    // Check if we should show timestamp
    const showTimestamp =
      !nextMessage ||
      nextMessage.senderId !== message.senderId ||
      new Date(nextMessage.createdAt).getTime() -
        new Date(message.createdAt).getTime() >
        300000; // 5 minutes

    const messageTime = formatMessageTime(new Date(message.createdAt));

    return (
      <div
        key={message.id}
        className={`flex ${isFromMe ? "justify-end" : "justify-start"} mb-1`}
      >
        <div
          className={`flex max-w-xs lg:max-w-md ${
            isFromMe ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {/* Avatar */}
          {!isFromMe && (
            <div className={`flex-shrink-0 ${showAvatar ? "mr-2" : "mr-8"}`}>
              {showAvatar && (
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center">
                    {message.sender?.profilePic ? (
                      <img
                        src={message.sender.profilePic}
                        alt={message.sender.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold">
                        {getInitials(message.sender?.fullName || "U")}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message Content */}
          <div
            className={`flex flex-col ${
              isFromMe ? "items-end" : "items-start"
            }`}
          >
            {/* Sender name (for group chats) */}
            {!isFromMe && showAvatar && message.sender && (
              <span className="text-xs text-base-content/70 mb-1 px-2">
                {message.sender.fullName}
              </span>
            )}

            {/* Message Bubble */}
            <div
              className={`
                px-4 py-2 rounded-2xl max-w-full break-words
                ${
                  isFromMe
                    ? "bg-primary text-primary-content rounded-br-md"
                    : "bg-base-200 text-base-content rounded-bl-md"
                }
              `}
            >
              {message.type === "TEXT" && (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}

              {message.type === "IMAGE" && (
                <div className="relative group">
                  <img
                    src={message.content}
                    alt="Shared image"
                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(message.content, "_blank")}
                    style={{ maxWidth: "300px", maxHeight: "400px" }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                      Click to view full size
                    </span>
                  </div>
                </div>
              )}

              {message.type === "FILE" && (
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-base-300 rounded">📎</div>
                  <span className="text-sm">{message.content}</span>
                </div>
              )}

              {message.type === "SYSTEM" && (
                <p className="text-sm italic text-base-content/70">
                  {message.content}
                </p>
              )}
            </div>

            {/* Timestamp */}
            {showTimestamp && (
              <span
                className={`
                text-xs text-base-content/50 mt-1 px-2
                ${isFromMe ? "text-right" : "text-left"}
              `}
              >
                {messageTime}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (conversationMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">👋</div>
          <p className="text-base-content/70">
            No messages yet. Start the conversation!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <div className="p-4 space-y-2">
        {conversationMessages.map((message, index) =>
          renderMessage(message, index)
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
