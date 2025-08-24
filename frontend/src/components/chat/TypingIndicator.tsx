import { useSocket } from "../../hooks/useSocket";
import { useChatStore } from "../../store/chatStore";

const TypingIndicator = () => {
  const { selectedConversationId } = useChatStore();
  const { getTypingUsers } = useSocket();

  if (!selectedConversationId) return null;

  const typingUsers = getTypingUsers(selectedConversationId);

  if (typingUsers.length === 0) return null;

  const formatTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userInfo.fullName} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userInfo.fullName} and ${typingUsers[1].userInfo.fullName} are typing...`;
    } else {
      return `${typingUsers[0].userInfo.fullName} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm text-base-content/70 italic">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span>{formatTypingText()}</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
