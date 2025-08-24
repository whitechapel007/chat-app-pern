import { LogOut, MessageCircle, Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import ConversationList from "./ConversationList";
import NewChatModal from "./NewChatModal";
import OnlineUsersList from "./OnlineUsersList";

interface LeftSidebarProps {
  onClose?: () => void;
}

const LeftSidebar = ({ onClose }: LeftSidebarProps) => {
  const { user, logout } = useAuthStore();
  const { searchQuery, setSearchQuery, onlineUsers } = useChatStore();
  const navigate = useNavigate();
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* User Profile Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    {getInitials(user?.fullName || "")}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base-content truncate">
                {user?.fullName}
              </h3>
              <p className="text-sm text-base-content/70 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <button onClick={handleLogout} className="text-error">
                  <LogOut size={16} />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-base-300">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50"
            size={16}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            className="input input-bordered w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Online Friends */}
      {onlineUsers.length > 0 && (
        <div className="p-4 border-b border-base-300 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm text-base-content/70 flex items-center">
              <Users size={16} className="mr-2" />
              Friends Online
            </h4>
            <span className="badge badge-primary badge-sm">
              {onlineUsers.length}
            </span>
          </div>
          <div className="max-h-20 overflow-hidden">
            <OnlineUsersList />
          </div>
        </div>
      )}

      {/* Conversations */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-base-content/70 flex items-center">
              <MessageCircle size={16} className="mr-2" />
              Chats
            </h4>
            <button
              className="btn btn-ghost btn-circle btn-xs"
              onClick={() => setIsNewChatModalOpen(true)}
              title="Start new chat"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <ConversationList onConversationSelect={onClose} />
        </div>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
      />
    </div>
  );
};

export default LeftSidebar;
