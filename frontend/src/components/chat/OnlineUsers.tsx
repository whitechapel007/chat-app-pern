import React from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useChatStore } from '../../store/chatStore';
import { Wifi, WifiOff, Users } from 'lucide-react';

const OnlineUsers: React.FC = () => {
  const { 
    isConnected, 
    onlineUsers, 
    onlineUserCount, 
    connectionStatus,
    isUserOnline 
  } = useSocket();
  
  const { conversations } = useChatStore();

  // Get user info from conversations
  const getUserInfo = (userId: string) => {
    for (const conversation of conversations) {
      const participant = conversation.participants.find(p => p.userId === userId);
      if (participant) {
        return participant.user;
      }
    }
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-base-100 border-l border-base-300 w-64 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users size={20} className="text-primary" />
            <h3 className="font-semibold">Online Users</h3>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi size={16} className="text-success" />
            ) : (
              <WifiOff size={16} className="text-error" />
            )}
            <span className="badge badge-primary badge-sm">
              {onlineUserCount}
            </span>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="mt-2">
          <div className={`text-xs flex items-center space-x-1 ${
            isConnected ? 'text-success' : 'text-error'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-success' : 'bg-error'
            } ${isConnected ? 'animate-pulse' : ''}`}></div>
            <span>
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'connecting' && 'Connecting...'}
              {connectionStatus === 'disconnected' && 'Disconnected'}
              {connectionStatus === 'error' && 'Connection Error'}
            </span>
          </div>
        </div>
      </div>

      {/* Online Users List */}
      <div className="flex-1 overflow-y-auto p-2">
        {!isConnected ? (
          <div className="text-center py-8 text-base-content/50">
            <WifiOff size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Not connected</p>
            <p className="text-xs">Trying to reconnect...</p>
          </div>
        ) : onlineUsers.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            <Users size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No users online</p>
          </div>
        ) : (
          <div className="space-y-1">
            {onlineUsers.map((onlineUser) => {
              const userInfo = getUserInfo(onlineUser.userId);
              
              if (!userInfo) {
                return (
                  <div
                    key={onlineUser.userId}
                    className="p-2 rounded-lg bg-base-200 opacity-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center">
                        <span className="text-xs">?</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-base-content/70">Unknown User</p>
                        <p className="text-xs text-base-content/50">
                          ID: {onlineUser.userId.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={onlineUser.userId}
                  className="p-2 rounded-lg hover:bg-base-200 transition-colors cursor-pointer"
                  title={`${userInfo.fullName} (@${userInfo.username})`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center">
                        {userInfo.profilePic ? (
                          <img
                            src={userInfo.profilePic}
                            alt={userInfo.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold">
                            {getInitials(userInfo.fullName)}
                          </span>
                        )}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {userInfo.fullName}
                      </p>
                      <p className="text-xs text-base-content/70 truncate">
                        @{userInfo.username}
                      </p>
                    </div>

                    {/* Socket ID (for debugging) */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-base-content/50">
                        {onlineUser.socketId.slice(0, 6)}...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-2 border-t border-base-300 bg-base-200">
          <div className="text-xs text-base-content/70">
            <div>Status: {connectionStatus}</div>
            <div>Online: {onlineUserCount}</div>
            {onlineUsers.length > 0 && (
              <div className="mt-1">
                <details>
                  <summary className="cursor-pointer">Socket IDs</summary>
                  <div className="mt-1 space-y-1">
                    {onlineUsers.map(user => (
                      <div key={user.userId} className="text-xs">
                        {user.userId.slice(0, 8)}: {user.socketId.slice(0, 8)}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineUsers;
