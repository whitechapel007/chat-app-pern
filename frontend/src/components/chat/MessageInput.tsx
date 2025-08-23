import React, { useState, useRef } from "react";
import { useChatStore } from "../../store/chatStore";
import { Send, Paperclip, Smile } from "lucide-react";

const MessageInput: React.FC = () => {
  const { 
    selectedConversationId, 
    sendMessage, 
    isSendingMessage 
  } = useChatStore();
  
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedConversationId || isSendingMessage) {
      return;
    }

    const messageContent = message.trim();
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await sendMessage(selectedConversationId, {
        content: messageContent,
        type: "TEXT"
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore message on error
      setMessage(messageContent);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleFileUpload = () => {
    // TODO: Implement file upload
    console.log("File upload not implemented yet");
  };

  const handleEmojiClick = () => {
    // TODO: Implement emoji picker
    console.log("Emoji picker not implemented yet");
  };

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
            onKeyPress={handleKeyPress}
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
            ${message.trim() && !isSendingMessage 
              ? 'btn-primary' 
              : 'btn-disabled'
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
    </div>
  );
};

export default MessageInput;
