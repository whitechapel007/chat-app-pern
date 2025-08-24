import { useState, useEffect } from "react";
import { useChatStore } from "../../store/chatStore";
import { chatAPI } from "../../services/chat";
import type { OnlineUser } from "../../types/chat";
import { Search, X, Users, Check } from "lucide-react";

interface GroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupChatModal = ({ isOpen, onClose }: GroupChatModalProps) => {
  const { createGroupConversation } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [step, setStep] = useState<"details" | "participants">("details");

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
        })
        .finally(() => {
          setLoadingUsers(false);
        });
    }
  }, [isOpen, users.length]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("details");
      setGroupName("");
      setGroupDescription("");
      setSelectedUsers(new Set());
      setSearchQuery("");
    }
  }, [isOpen]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.size === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await createGroupConversation({
        type: "GROUP",
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        participantIds: Array.from(selectedUsers),
      });
      onClose();
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("details");
    setGroupName("");
    setGroupDescription("");
    setSelectedUsers(new Set());
    setSearchQuery("");
    onClose();
  };

  const canProceedToParticipants = groupName.trim().length > 0;
  const canCreateGroup = groupName.trim().length > 0 && selectedUsers.size > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users size={20} className="text-primary" />
            <h3 className="text-lg font-semibold">
              {step === "details" ? "Create Group Chat" : "Add Participants"}
            </h3>
          </div>
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={handleClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === "details" ? "text-primary" : "text-success"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                step === "details" ? "bg-primary text-primary-content" : "bg-success text-success-content"
              }`}>
                {step === "details" ? "1" : <Check size={14} />}
              </div>
              <span className="text-sm font-medium">Details</span>
            </div>
            <div className="w-8 h-px bg-base-300"></div>
            <div className={`flex items-center space-x-2 ${step === "participants" ? "text-primary" : "text-base-content/50"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                step === "participants" ? "bg-primary text-primary-content" : "bg-base-300"
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Participants</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {step === "details" ? (
            <div className="p-4 space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Group Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter group name..."
                  className="input input-bordered w-full"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={50}
                />
                <div className="label">
                  <span className="label-text-alt text-base-content/50">
                    {groupName.length}/50 characters
                  </span>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Description (Optional)</span>
                </label>
                <textarea
                  placeholder="What's this group about?"
                  className="textarea textarea-bordered w-full h-20 resize-none"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  maxLength={200}
                />
                <div className="label">
                  <span className="label-text-alt text-base-content/50">
                    {groupDescription.length}/200 characters
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
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
                {selectedUsers.size > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-base-content/70 mb-2">
                      Selected: {selectedUsers.size} participant{selectedUsers.size !== 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedUsers).map((userId) => {
                        const user = users.find((u) => u.id === userId);
                        if (!user) return null;
                        return (
                          <div
                            key={userId}
                            className="badge badge-primary gap-2"
                          >
                            {user.fullName.split(" ")[0]}
                            <button
                              className="btn btn-ghost btn-xs btn-circle"
                              onClick={() => toggleUserSelection(userId)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* User List */}
              <div className="flex-1 overflow-y-auto p-2">
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="text-base-content/50 mt-2">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-base-content/50">
                    {searchQuery ? "No users found" : "No users available"}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredUsers.map((user) => {
                      const isSelected = selectedUsers.has(user.id);
                      return (
                        <div
                          key={user.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 flex items-center space-x-3 ${
                            isSelected
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-base-200"
                          }`}
                          onClick={() => toggleUserSelection(user.id)}
                        >
                          {/* Checkbox */}
                          <div className="flex-shrink-0">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-primary"
                              checked={isSelected}
                              onChange={() => toggleUserSelection(user.id)}
                            />
                          </div>

                          {/* Avatar */}
                          <div className="relative">
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center">
                                {user.profilePic ? (
                                  <img
                                    src={user.profilePic}
                                    alt={user.fullName}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-semibold">
                                    {getInitials(user.fullName)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {user.isOnline && (
                              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border border-base-100"></div>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-base-content truncate">
                              {user.fullName}
                            </h4>
                            <p className="text-sm text-base-content/70 truncate">
                              @{user.username}
                            </p>
                          </div>

                          {/* Online Status */}
                          <div className="flex-shrink-0">
                            <div
                              className={`badge badge-sm ${
                                user.isOnline ? "badge-success" : "badge-ghost"
                              }`}
                            >
                              {user.isOnline ? "Online" : "Offline"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300">
          <div className="flex space-x-3">
            {step === "details" ? (
              <>
                <button className="btn btn-outline flex-1" onClick={handleClose}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary flex-1"
                  onClick={() => setStep("participants")}
                  disabled={!canProceedToParticipants}
                >
                  Next
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-outline flex-1"
                  onClick={() => setStep("details")}
                >
                  Back
                </button>
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleCreateGroup}
                  disabled={!canCreateGroup || isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Create Group"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )}
    </div>
  );
};

export default GroupChatModal;
