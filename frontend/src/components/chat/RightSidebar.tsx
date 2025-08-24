import {
  FileText,
  Image,
  Link,
  Phone,
  Search,
  Settings,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";
import React from "react";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";

interface RightSidebarProps {
  onClose?: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ onClose }) => {
  const { user } = useAuthStore();
  const { selectedConversationId, conversations: rawConversations } =
    useChatStore();

  // Ensure conversations is always an array
  const conversations = Array.isArray(rawConversations) ? rawConversations : [];

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  );

  if (!selectedConversation) {
    return null;
  }

  const getConversationName = () => {
    if (selectedConversation.type === "GROUP") {
      return selectedConversation.name || "Group Chat";
    }

    const otherParticipant = selectedConversation.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user.fullName || "Unknown User";
  };

  const getConversationAvatar = () => {
    if (selectedConversation.type === "GROUP") {
      return null;
    }

    const otherParticipant = selectedConversation.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user.profilePic;
  };

  const getOtherParticipant = () => {
    if (selectedConversation.type === "GROUP") {
      return null;
    }

    return selectedConversation.participants.find((p) => p.userId !== user?.id)
      ?.user;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const conversationName = getConversationName();
  const avatarUrl = getConversationAvatar();
  const otherParticipant = getOtherParticipant();

  // Mock data for shared files and links
  const sharedFiles = [
    { id: 1, name: "PhotoDanver.jpg", size: "175 KB", type: "image", url: "#" },
    { id: 2, name: "PhotoDanver.jpg", size: "175 KB", type: "image", url: "#" },
    { id: 3, name: "PhotoDanver.jpg", size: "175 KB", type: "image", url: "#" },
    { id: 4, name: "PhotoDanver.jpg", size: "175 KB", type: "image", url: "#" },
  ];

  const sharedLinks = [
    {
      id: 1,
      title: "Dribbble.com",
      url: "https://dribbble.com",
      time: "10:43pm",
    },
    {
      id: 2,
      title: "Awwwards.com",
      url: "https://awwwards.com",
      time: "10:32pm",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-base-300 flex items-center justify-between flex-shrink-0">
        <h3 className="font-semibold">Contact Info</h3>
        <button
          className="btn btn-ghost btn-circle btn-sm lg:hidden"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* User Profile */}
        <div className="p-6 border-b border-base-300 text-center">
          <div className="avatar mb-4">
            <div className="w-20 h-20 rounded-full bg-base-300 flex items-center justify-center mx-auto">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={conversationName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold">
                  {selectedConversation.type === "GROUP"
                    ? "👥"
                    : getInitials(conversationName)}
                </span>
              )}
            </div>
          </div>

          <h3 className="font-semibold text-lg mb-1">{conversationName}</h3>

          {otherParticipant && (
            <>
              <p className="text-sm text-base-content/70 mb-1">
                @{otherParticipant.username}
              </p>
              <p className="text-sm text-base-content/70 mb-4">
                {otherParticipant.email}
              </p>
              <div
                className={`badge ${
                  otherParticipant.isOnline ? "badge-success" : "badge-ghost"
                }`}
              >
                {otherParticipant.isOnline ? "Online" : "Offline"}
              </div>
            </>
          )}

          {selectedConversation.type === "GROUP" && (
            <p className="text-sm text-base-content/70">
              {selectedConversation.participants.length} members
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-6">
            <button className="btn btn-circle btn-outline">
              <Phone size={16} />
            </button>
            <button className="btn btn-circle btn-outline">
              <Video size={16} />
            </button>
            <button className="btn btn-circle btn-outline">
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Group Participants (only for group chats) */}
        {selectedConversation.type === "GROUP" && (
          <div className="p-4 border-b border-base-300">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm flex items-center">
                <Users size={16} className="mr-2" />
                Participants ({selectedConversation.participants.length})
              </h4>
              <button
                className="btn btn-ghost btn-circle btn-xs"
                title="Add participant"
              >
                <UserPlus size={14} />
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedConversation.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center space-x-3 p-2 hover:bg-base-200 rounded-lg"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center">
                        {participant.user.profilePic ? (
                          <img
                            src={participant.user.profilePic}
                            alt={participant.user.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold">
                            {getInitials(participant.user.fullName)}
                          </span>
                        )}
                      </div>
                    </div>
                    {participant.user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-success rounded-full border border-base-100"></div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">
                        {participant.user.fullName}
                        {participant.userId === user?.id && " (You)"}
                      </p>
                      {participant.role === "ADMIN" && (
                        <span className="badge badge-primary badge-xs">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-base-content/70">
                      @{participant.user.username}
                    </p>
                  </div>

                  {/* Actions */}
                  {participant.userId !== user?.id && (
                    <div className="dropdown dropdown-end">
                      <button
                        tabIndex={0}
                        className="btn btn-ghost btn-circle btn-xs"
                      >
                        <Settings size={12} />
                      </button>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
                      >
                        <li>
                          <a className="text-sm">View Profile</a>
                        </li>
                        <li>
                          <a className="text-sm">Send Message</a>
                        </li>
                        <li>
                          <a className="text-sm text-error">Remove</a>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared Files */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm flex items-center">
              <Image size={16} className="mr-2" />
              Shared Files
            </h4>
            <button className="text-primary text-sm hover:underline">
              see all
            </button>
          </div>

          <div className="space-y-2">
            {sharedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-2 hover:bg-base-200 rounded-lg cursor-pointer"
              >
                <div className="w-10 h-10 bg-base-300 rounded-lg flex items-center justify-center">
                  {file.type === "image" ? (
                    <Image size={16} />
                  ) : (
                    <FileText size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-base-content/70">{file.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shared Links */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm flex items-center">
              <Link size={16} className="mr-2" />
              Shared Links
            </h4>
            <button className="text-primary text-sm hover:underline">
              see all
            </button>
          </div>

          <div className="space-y-2">
            {sharedLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center space-x-3 p-2 hover:bg-base-200 rounded-lg cursor-pointer"
              >
                <div className="w-10 h-10 bg-base-300 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🌐</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{link.title}</p>
                  <p className="text-xs text-base-content/70">{link.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
