import { MessageCircle, Search, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { chatAPI } from "../../services/chat";
import { useChatStore } from "../../store/chatStore";
import type { OnlineUser } from "../../types/chat";
import GroupChatModal from "./GroupChatModal";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChatModal = ({ isOpen, onClose }: NewChatModalProps) => {
  const { sendDirectMessage } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = useState(false);

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen && users.length === 0) {
      setLoadingUsers(true);
      chatAPI
        .getUsers()
        .then((fetchedUsers) => {
          setUsers(fetchedUsers);
        })
        .catch((error) => {
          console.error("Failed to fetch users:", error);
          // Fallback to mock users for demo purposes
        })
        .finally(() => {
          setLoadingUsers(false);
        });
    }
  }, [isOpen, users.length]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStartChat = async (selectedUser: OnlineUser) => {
    setIsLoading(true);
    try {
      await sendDirectMessage(selectedUser.id, {
        content: `👋 Hey ${selectedUser.fullName.split(" ")[0]}!`,
        type: "TEXT",
      });
      onClose();
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to start chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  if (!isOpen && !isGroupChatModalOpen) return null;

  return (
    <>
      {/* Group Chat Modal */}
      <GroupChatModal
        isOpen={isGroupChatModalOpen}
        onClose={() => setIsGroupChatModalOpen(false)}
      />

      {/* Main New Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-base-300 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Start New Chat</h3>
              <button
                className="btn btn-ghost btn-circle btn-sm"
                onClick={handleClose}
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Type Options */}
            <div className="p-4 border-b border-base-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-sm text-base-content/70 mb-2">
                    Direct Message
                  </div>
                  <div className="flex items-center justify-center">
                    <MessageCircle size={20} className="text-primary" />
                  </div>
                </div>
                <div className="text-center">
                  <button
                    className="btn btn-outline btn-sm w-full"
                    onClick={() => {
                      setIsGroupChatModalOpen(true);
                      onClose();
                    }}
                  >
                    <Users size={16} />
                    Create Group
                  </button>
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
                  placeholder="Search users..."
                  className="input input-bordered w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="loading loading-spinner loading-lg"></div>
                  <p className="text-base-content/50 mt-2">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-base-content/50">
                  {searchQuery ? "No users found" : "No users available"}
                </div>
              ) : (
                <div className="space-y-1">
                  {users.map((user_item) => (
                    <div
                      key={user_item.id}
                      className="p-3 rounded-lg hover:bg-base-200 cursor-pointer transition-colors duration-200 flex items-center space-x-3"
                      onClick={() => handleStartChat(user_item)}
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center">
                            {user_item.profilePic ? (
                              <img
                                src={user_item.profilePic}
                                alt={user_item.fullName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold">
                                {getInitials(user_item.fullName)}
                              </span>
                            )}
                          </div>
                        </div>
                        {user_item.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base-content truncate">
                          {user_item.fullName}
                        </h4>
                        <p className="text-sm text-base-content/70 truncate">
                          @{user_item.username}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div
                            className={`badge badge-sm ${
                              user_item.isOnline
                                ? "badge-success"
                                : "badge-ghost"
                            }`}
                          >
                            {user_item.isOnline ? "Online" : "Offline"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-base-300">
              <button className="btn btn-outline w-full" onClick={handleClose}>
                Cancel
              </button>
            </div>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NewChatModal;
