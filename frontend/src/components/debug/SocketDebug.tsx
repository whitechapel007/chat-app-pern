import React from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../store/authStore';

const SocketDebug: React.FC = () => {
  const { 
    isConnected, 
    connectionStatus, 
    onlineUsers, 
    onlineUserCount,
    lastError,
    socket 
  } = useSocket();
  
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="fixed bottom-4 right-4 bg-base-100 border border-base-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-bold text-lg mb-2">🔧 Socket Debug</h3>
      
      {/* Connection Status */}
      <div className="space-y-2 text-sm">
        <div>
          <strong>Connection:</strong> 
          <span className={`ml-2 ${isConnected ? 'text-success' : 'text-error'}`}>
            {connectionStatus}
          </span>
        </div>
        
        <div>
          <strong>Socket ID:</strong> 
          <span className="ml-2 font-mono text-xs">
            {socket?.id || 'Not connected'}
          </span>
        </div>
        
        <div>
          <strong>User:</strong> 
          <span className="ml-2">
            {isAuthenticated ? user?.fullName : 'Not authenticated'}
          </span>
        </div>
        
        <div>
          <strong>User ID:</strong> 
          <span className="ml-2 font-mono text-xs">
            {user?.id || 'None'}
          </span>
        </div>
        
        {lastError && (
          <div>
            <strong>Error:</strong> 
            <span className="ml-2 text-error text-xs">{lastError}</span>
          </div>
        )}
        
        <div>
          <strong>Online Users Count:</strong> 
          <span className="ml-2 badge badge-primary badge-sm">
            {onlineUserCount}
          </span>
        </div>
        
        {/* Online Users List */}
        <div>
          <strong>Online Users:</strong>
          {onlineUsers.length === 0 ? (
            <div className="text-base-content/50 text-xs ml-2">None</div>
          ) : (
            <div className="mt-1 space-y-1">
              {onlineUsers.map((user, index) => (
                <div key={user.userId} className="text-xs bg-base-200 p-1 rounded">
                  <div><strong>#{index + 1}</strong></div>
                  <div><strong>ID:</strong> {user.userId.slice(0, 8)}...</div>
                  <div><strong>Socket:</strong> {user.socketId?.slice(0, 8)}...</div>
                  <div><strong>Online:</strong> {user.isOnline ? '✅' : '❌'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Raw Data */}
        <details className="mt-2">
          <summary className="cursor-pointer text-xs">Raw Data</summary>
          <pre className="text-xs bg-base-200 p-2 rounded mt-1 overflow-auto max-h-32">
            {JSON.stringify({
              isConnected,
              connectionStatus,
              onlineUsers,
              socketId: socket?.id,
              userId: user?.id
            }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default SocketDebug;
