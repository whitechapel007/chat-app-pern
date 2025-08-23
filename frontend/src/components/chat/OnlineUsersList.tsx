import React from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";

const OnlineUsersList: React.FC = () => {
  const { user } = useAuthStore();
  const { onlineUsers, sendDirectMessage } = useChatStore();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUserClick = async (userId: string) => {
    // Start a conversation with this user
    try {
      await sendDirectMessage(userId, {
        content: "👋 Hey there!",
        type: "TEXT"
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  // Filter out the current user from online users
  const filteredOnlineUsers = onlineUsers.filter(onlineUser => onlineUser.id !== user?.id);

  if (filteredOnlineUsers.length === 0) {
    return (
      <div className="text-center text-base-content/50 text-sm py-2">
        No friends online
      </div>
    );
  }

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {filteredOnlineUsers.slice(0, 8).map((onlineUser) => (
        <div
          key={onlineUser.id}
          className="flex-shrink-0 cursor-pointer group"
          onClick={() => handleUserClick(onlineUser.id)}
        >
          <div className="flex flex-col items-center space-y-1">
            <div className="relative">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center group-hover:ring-2 group-hover:ring-primary transition-all">
                  {onlineUser.profilePic ? (
                    <img 
                      src={onlineUser.profilePic} 
                      alt={onlineUser.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold">
                      {getInitials(onlineUser.fullName)}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
            </div>
            <span className="text-xs text-center text-base-content/70 max-w-[60px] truncate">
              {onlineUser.fullName.split(" ")[0]}
            </span>
          </div>
        </div>
      ))}
      
      {filteredOnlineUsers.length > 8 && (
        <div className="flex-shrink-0 flex flex-col items-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center">
            <span className="text-xs font-semibold">
              +{filteredOnlineUsers.length - 8}
            </span>
          </div>
          <span className="text-xs text-center text-base-content/70">
            more
          </span>
        </div>
      )}
    </div>
  );
};

export default OnlineUsersList;
