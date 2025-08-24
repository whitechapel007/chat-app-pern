import { Paperclip, Send, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../hooks/useSocket";
import { useChatStore } from "../../store/chatStore";
import EmojiPicker from "./EmojiPicker";
import FileUploadModal from "./FileUploadModal";

const MessageInput = () => {
  const { selectedConversationId, sendMessage, isSendingMessage, uploadImage } =
    useChatStore();
  const { startTyping, stopTyping } = useSocket();

  const [message, setMessage] = useState("");
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !selectedConversationId || isSendingMessage) {
      return;
    }

    const messageContent = message.trim();
    setMessage("");

    // Stop typing when sending message
    if (isTyping && selectedConversationId) {
      stopTyping(selectedConversationId);
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await sendMessage(selectedConversationId, {
        content: messageContent,
        type: "TEXT",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore message on error
      setMessage(messageContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;

    // Handle typing indicators
    if (selectedConversationId) {
      if (newValue.trim() && !isTyping) {
        // User started typing
        setIsTyping(true);
        startTyping(selectedConversationId);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing after 3 seconds of inactivity
      if (newValue.trim()) {
        typingTimeoutRef.current = setTimeout(() => {
          if (isTyping) {
            setIsTyping(false);
            stopTyping(selectedConversationId);
          }
        }, 3000);
      } else if (isTyping) {
        // User cleared the input, stop typing immediately
        setIsTyping(false);
        stopTyping(selectedConversationId);
      }
    }
  };

  const handleFileUpload = () => {
    setIsFileUploadOpen(true);
  };

  const handleEmojiClick = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
  };

  const handleFileUploadSubmit = async (file: File) => {
    if (!selectedConversationId) return;

    try {
      await uploadImage(selectedConversationId, file);
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);

      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setMessage(message + emoji);
    }
  };

  // Cleanup typing state when conversation changes or component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping && selectedConversationId) {
        stopTyping(selectedConversationId);
      }
    };
  }, [selectedConversationId, isTyping, stopTyping]);

  // Stop typing when conversation changes
  useEffect(() => {
    if (isTyping && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
    }
  }, [selectedConversationId]);

  if (!selectedConversationId) {
    return null;
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* File Upload Button */}
        <button
          type="button"
          className="btn btn-ghost btn-circle btn-sm flex-shrink-0"
          onClick={handleFileUpload}
          disabled={isSendingMessage}
        >
          <Paperclip size={16} />
        </button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="textarea textarea-bordered w-full resize-none min-h-[2.5rem] max-h-[120px] pr-12"
            rows={1}
            disabled={isSendingMessage}
          />

          {/* Emoji Button */}
          <button
            type="button"
            className="absolute right-2 bottom-2 btn btn-ghost btn-circle btn-xs"
            onClick={handleEmojiClick}
            disabled={isSendingMessage}
          >
            <Smile size={16} />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className={`
            btn btn-circle flex-shrink-0
            ${
              message.trim() && !isSendingMessage
                ? "btn-primary"
                : "btn-disabled"
            }
          `}
          disabled={!message.trim() || isSendingMessage}
        >
          {isSendingMessage ? (
            <div className="loading loading-spinner loading-sm"></div>
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isFileUploadOpen}
        onClose={() => setIsFileUploadOpen(false)}
        onUpload={handleFileUploadSubmit}
        isUploading={isSendingMessage}
      />

      {/* Emoji Picker */}
      <div className="relative">
        <EmojiPicker
          isOpen={isEmojiPickerOpen}
          onClose={() => setIsEmojiPickerOpen(false)}
          onEmojiSelect={handleEmojiSelect}
          position={{ bottom: 60, right: 20 }}
        />
      </div>
    </div>
  );
};

export default MessageInput;
