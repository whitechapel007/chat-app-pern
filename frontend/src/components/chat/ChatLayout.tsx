import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import SocketDebug from "../debug/SocketDebug";
import LoadingSpinner from "../ui/LoadingSpinner";
import ChatArea from "./ChatArea";
import ConnectionStatus from "./ConnectionStatus";
import LeftSidebar from "./LeftSidebar";
import OnlineUsers from "./OnlineUsers";
import RightSidebar from "./RightSidebar";

const ChatLayout = () => {
  const { user } = useAuthStore();
  const {
    loadConversations,
    loadOnlineUsers,
    isLoading,
    error,
    selectedConversationId,
  } = useChatStore();

  // Initialize socket connection

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [onlineUsersOpen, setOnlineUsersOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
      loadOnlineUsers();
    }
  }, [user, loadConversations, loadOnlineUsers]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <LoadingSpinner size="lg" text="Loading chat..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="alert alert-error max-w-md">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-200 flex overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          className="btn btn-circle btn-primary"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        >
          {leftSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Left Sidebar */}
      <div
        className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${leftSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        w-80 h-full bg-base-100 border-r border-base-300 z-40
        lg:flex lg:flex-col overflow-hidden
      `}
      >
        <LeftSidebar onClose={() => setLeftSidebarOpen(false)} />
      </div>

      {/* Mobile Overlay */}
      {leftSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Connection Status */}
        <ConnectionStatus />

        <ChatArea
          onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
        />
      </div>

      {/* Right Sidebar */}
      <div
        className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${rightSidebarOpen ? "translate-x-0" : "translate-x-full"}
        w-80 h-full bg-base-100 border-l border-base-300 z-40
        ${selectedConversationId ? "lg:flex lg:flex-col" : "hidden"}
        right-0
      `}
      >
        <RightSidebar onClose={() => setRightSidebarOpen(false)} />
      </div>

      {/* Right Sidebar Mobile Overlay */}
      {rightSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setRightSidebarOpen(false)}
        />
      )}

      {/* Online Users Panel */}
      <div
        className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${onlineUsersOpen ? "translate-x-0" : "translate-x-full"}
        w-64 h-full bg-base-100 border-l border-base-300 z-40
        lg:flex lg:flex-col
        right-0
      `}
      >
        <OnlineUsers />
      </div>

      {/* Online Users Mobile Overlay */}
      {onlineUsersOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setOnlineUsersOpen(false)}
        />
      )}

      {/* Debug Component (Development Only) */}
      {process.env.NODE_ENV === "development" && <SocketDebug />}
    </div>
  );
};

export default ChatLayout;
