interface SendMessageData {
    content: string;
    type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
}
interface CreateConversationData {
    type: "DIRECT" | "GROUP";
    name?: string;
    description?: string;
    participantIds: string[];
}
interface GetMessagesOptions {
    page?: number;
    limit?: number;
    before?: string;
    after?: string;
}
export declare const getOrCreateDirectConversation: (user1Id: string, user2Id: string) => Promise<{
    participants: ({
        user: {
            id: string;
            username: string;
            fullName: string;
            profilePic: string;
            isOnline: boolean;
        };
    } & {
        id: string;
        conversationId: string;
        userId: string;
        role: import(".prisma/client").$Enums.ParticipantRole;
        joinedAt: Date;
        leftAt: Date | null;
    })[];
} & {
    name: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.ConversationType;
    description: string | null;
}>;
export declare const createGroupConversation: (creatorId: string, conversationData: CreateConversationData) => Promise<{
    participants: ({
        user: {
            id: string;
            username: string;
            fullName: string;
            profilePic: string;
        };
    } & {
        id: string;
        conversationId: string;
        userId: string;
        role: import(".prisma/client").$Enums.ParticipantRole;
        joinedAt: Date;
        leftAt: Date | null;
    })[];
} & {
    name: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.ConversationType;
    description: string | null;
}>;
export declare const addParticipantToGroup: (conversationId: string, userId: string, addedByUserId: string) => Promise<{
    user: {
        id: string;
        username: string;
        fullName: string;
        profilePic: string;
    };
} & {
    id: string;
    conversationId: string;
    userId: string;
    role: import(".prisma/client").$Enums.ParticipantRole;
    joinedAt: Date;
    leftAt: Date | null;
}>;
export declare const removeParticipantFromGroup: (conversationId: string, userId: string, removedByUserId: string) => Promise<{
    success: boolean;
}>;
export declare const updateGroupConversation: (conversationId: string, userId: string, updates: {
    name?: string;
    description?: string;
}) => Promise<{
    participants: ({
        user: {
            id: string;
            username: string;
            fullName: string;
            profilePic: string;
        };
    } & {
        id: string;
        conversationId: string;
        userId: string;
        role: import(".prisma/client").$Enums.ParticipantRole;
        joinedAt: Date;
        leftAt: Date | null;
    })[];
} & {
    name: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.ConversationType;
    description: string | null;
}>;
export declare const sendMessage: (senderId: string, conversationId: string, data: SendMessageData) => Promise<{
    sender: {
        id: string;
        username: string;
        fullName: string;
        profilePic: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    type: import(".prisma/client").$Enums.MessageType;
    senderId: string;
    conversationId: string;
    replyToId: string | null;
}>;
export declare const sendDirectMessage: (senderId: string, receiverId: string, data: SendMessageData) => Promise<{
    message: {
        sender: {
            id: string;
            username: string;
            fullName: string;
            profilePic: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        type: import(".prisma/client").$Enums.MessageType;
        senderId: string;
        conversationId: string;
        replyToId: string | null;
    };
    conversationId: string;
    conversation: {
        participants: ({
            user: {
                id: string;
                username: string;
                fullName: string;
                profilePic: string;
                isOnline: boolean;
            };
        } & {
            id: string;
            conversationId: string;
            userId: string;
            role: import(".prisma/client").$Enums.ParticipantRole;
            joinedAt: Date;
            leftAt: Date | null;
        })[];
    } & {
        name: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ConversationType;
        description: string | null;
    };
}>;
export declare const getMessages: (userId: string, conversationId: string, options?: GetMessagesOptions) => Promise<{
    messages: ({
        sender: {
            id: string;
            username: string;
            fullName: string;
            profilePic: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        type: import(".prisma/client").$Enums.MessageType;
        senderId: string;
        conversationId: string;
        replyToId: string | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}>;
export declare const deleteMessage: (userId: string, messageId: string) => Promise<{
    message: string;
}>;
export declare const updateMessage: (userId: string, messageId: string, data: {
    content: string;
}) => Promise<{
    sender: {
        id: string;
        username: string;
        fullName: string;
        profilePic: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    type: import(".prisma/client").$Enums.MessageType;
    senderId: string;
    conversationId: string;
    replyToId: string | null;
}>;
export declare const getUserConversations: (userId: string) => Promise<({
    messages: ({
        sender: {
            id: string;
            username: string;
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        type: import(".prisma/client").$Enums.MessageType;
        senderId: string;
        conversationId: string;
        replyToId: string | null;
    })[];
    participants: ({
        user: {
            id: string;
            username: string;
            fullName: string;
            profilePic: string;
            isOnline: boolean;
        };
    } & {
        id: string;
        conversationId: string;
        userId: string;
        role: import(".prisma/client").$Enums.ParticipantRole;
        joinedAt: Date;
        leftAt: Date | null;
    })[];
} & {
    name: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.ConversationType;
    description: string | null;
})[]>;
export declare const getConversationById: (conversationId: string) => Promise<({
    participants: ({
        user: {
            id: string;
            username: string;
            fullName: string;
            profilePic: string;
            isOnline: boolean;
        };
    } & {
        id: string;
        conversationId: string;
        userId: string;
        role: import(".prisma/client").$Enums.ParticipantRole;
        joinedAt: Date;
        leftAt: Date | null;
    })[];
} & {
    name: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.ConversationType;
    description: string | null;
}) | null>;
export {};
//# sourceMappingURL=message.services.d.ts.map