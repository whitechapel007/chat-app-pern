import { AlertCircle, Loader2, Wifi, WifiOff } from "lucide-react";
import React from "react";
import { useSocket } from "../../hooks/useSocket";
import { useAuthStore } from "../../store/authStore";

const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionStatus, lastError, onlineUserCount, connect } =
    useSocket();

  const { user } = useAuthStore();

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi size={16} className="text-success" />;
      case "connecting":
        return <Loader2 size={16} className="text-warning animate-spin" />;
      case "error":
        return <AlertCircle size={16} className="text-error" />;
      case "disconnected":
      default:
        return <WifiOff size={16} className="text-error" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return `Connected • ${onlineUserCount} online`;
      case "connecting":
        return "Connecting...";
      case "error":
        return lastError ? `Error: ${lastError}` : "Connection error";
      case "disconnected":
      default:
        return "Disconnected";
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-success";
      case "connecting":
        return "text-warning";
      case "error":
      case "disconnected":
      default:
        return "text-error";
    }
  };

  const handleReconnect = () => {
    if (user) {
      connect(user.id);
    }
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-base-200 border-b border-base-300">
      {/* Status Icon */}
      <div className="flex-shrink-0">{getStatusIcon()}</div>

      {/* Status Text */}
      <div className={`flex-1 text-sm ${getStatusColor()}`}>
        {getStatusText()}
      </div>

      {/* Reconnect Button */}
      {(connectionStatus === "error" ||
        connectionStatus === "disconnected") && (
        <button
          onClick={handleReconnect}
          className="btn btn-xs btn-outline"
          disabled={connectionStatus === "connecting"}
        >
          Retry
        </button>
      )}

      {/* Connection Indicator Dot */}
      <div className="flex-shrink-0">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-success animate-pulse" : "bg-error"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
