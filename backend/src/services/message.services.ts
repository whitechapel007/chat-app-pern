import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "../utils/errors.js";
import {
  messageSchema,
  validateInput,
} from "../validators/message.validator.js";

// Types for message operations
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

// Create or get direct conversation between two users
export const getOrCreateDirectConversation = async (
  user1Id: string,
  user2Id: string
) => {
  // Use a transaction to handle race conditions
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Find existing direct conversation between these two users
    const existingConversation = await tx.conversation.findFirst({
      where: {
        type: "DIRECT",
        AND: [
          {
            participants: {
              some: {
                userId: user1Id,
              },
            },
          },
          {
            participants: {
              some: {
                userId: user2Id,
              },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profilePic: true,
                isOnline: true,
              },
            },
          },
        },
      },
    });

    // Verify this is exactly a conversation between these two users
    if (existingConversation) {
      const participantIds = existingConversation.participants
        .filter((p: any) => !p.leftAt) // Only active participants
        .map((p: any) => p.userId);

      if (
        participantIds.length === 2 &&
        participantIds.includes(user1Id) &&
        participantIds.includes(user2Id)
      ) {
        return existingConversation;
      }
    }

    // If no existing conversation found, create new one
    try {
      const newConversation = await tx.conversation.create({
        data: {
          type: "DIRECT",
          participants: {
            create: [{ userId: user1Id }, { userId: user2Id }],
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  profilePic: true,
                },
              },
            },
          },
        },
      });

      return newConversation;
    } catch (error: any) {
      // If creation fails due to unique constraint, try to find the conversation again
      if (error.code === "P2002") {
        const retryConversation = await tx.conversation.findFirst({
          where: {
            type: "DIRECT",
            AND: [
              {
                participants: {
                  some: {
                    userId: user1Id,
                  },
                },
              },
              {
                participants: {
                  some: {
                    userId: user2Id,
                  },
                },
              },
            ],
          },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    fullName: true,
                    profilePic: true,
                    isOnline: true,
                  },
                },
              },
            },
          },
        });

        if (retryConversation) {
          const participantIds = retryConversation.participants
            .filter((p: any) => !p.leftAt) // Only active participants
            .map((p: any) => p.userId);

          if (
            participantIds.length === 2 &&
            participantIds.includes(user1Id) &&
            participantIds.includes(user2Id)
          ) {
            return retryConversation;
          }
        }
      }

      throw error;
    }
  });
};

// Create a group conversation
export const createGroupConversation = async (
  creatorId: string,
  conversationData: CreateConversationData
) => {
  const { type, name, description, participantIds } = conversationData;

  // Validate input
  if (type !== "GROUP") {
    throw new ValidationError("Invalid conversation type for group creation");
  }

  if (!name || name.trim().length === 0) {
    throw new ValidationError("Group name is required");
  }

  if (!participantIds || participantIds.length === 0) {
    throw new ValidationError("At least one participant is required");
  }

  // Ensure creator is included in participants
  const allParticipantIds = Array.from(new Set([creatorId, ...participantIds]));

  // Validate all participants exist
  const users = await prisma.user.findMany({
    where: {
      id: { in: allParticipantIds },
    },
  });

  if (users.length !== allParticipantIds.length) {
    throw new ValidationError("One or more participants not found");
  }

  // Create group conversation with participants
  const conversation = await prisma.conversation.create({
    data: {
      type: "GROUP",
      name: name.trim(),
      description: description?.trim() || null,
      participants: {
        create: allParticipantIds.map((userId) => ({
          userId,
          role: userId === creatorId ? "ADMIN" : "MEMBER",
        })),
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePic: true,
            },
          },
        },
      },
    },
  });

  // Create system message about group creation
  await prisma.message.create({
    data: {
      content: `${
        users.find((u: any) => u.id === creatorId)?.fullName || "Someone"
      } created the group "${name}"`,
      type: "SYSTEM",
      senderId: creatorId,
      conversationId: conversation.id,
    },
  });

  return conversation;
};

// Add participant to group conversation
export const addParticipantToGroup = async (
  conversationId: string,
  userId: string,
  addedByUserId: string
) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Check if conversation exists and is a group
    const conversation = await tx.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    if (conversation.type !== "GROUP") {
      throw new ValidationError(
        "Can only add participants to group conversations"
      );
    }

    // Check if user adding has admin rights
    const adderParticipant = await tx.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: addedByUserId,
        },
      },
    });

    if (!adderParticipant || adderParticipant.role !== "ADMIN") {
      throw new AuthorizationError("Only admins can add participants");
    }

    // Check if user exists
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if user is already a participant
    const existingParticipant = await tx.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (existingParticipant && !existingParticipant.leftAt) {
      throw new ValidationError("User is already a participant");
    }

    // Create or reactivate participant
    let participant;
    if (existingParticipant && existingParticipant.leftAt) {
      // User was previously in conversation, reactivate them
      participant = await tx.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        data: {
          leftAt: null,
          joinedAt: new Date(),
          role: "MEMBER",
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePic: true,
            },
          },
        },
      });
    } else {
      // Create new participant
      participant = await tx.conversationParticipant.create({
        data: {
          conversationId,
          userId,
          role: "MEMBER",
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePic: true,
            },
          },
        },
      });
    }

    // Create system message about the addition
    const adder = await tx.user.findUnique({
      where: { id: addedByUserId },
      select: { fullName: true },
    });

    await tx.message.create({
      data: {
        content: `${adder?.fullName || "Someone"} added ${
          user.fullName || user.username
        } to the group`,
        type: "SYSTEM",
        senderId: addedByUserId,
        conversationId,
      },
    });

    return participant;
  });
};

// Remove participant from group conversation
export const removeParticipantFromGroup = async (
  conversationId: string,
  userId: string,
  removedByUserId: string
) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Check if conversation exists and is a group
    const conversation = await tx.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    if (conversation.type !== "GROUP") {
      throw new ValidationError(
        "Can only remove participants from group conversations"
      );
    }

    // Check if user removing has admin rights (or is removing themselves)
    const removerParticipant = await tx.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: removedByUserId,
        },
      },
    });

    const isSelfRemoval = userId === removedByUserId;
    const isAdminRemoval = removerParticipant?.role === "ADMIN";

    if (!isSelfRemoval && !isAdminRemoval) {
      throw new AuthorizationError("Only admins can remove other participants");
    }

    // Check if participant exists
    const participant = await tx.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    if (!participant || participant.leftAt) {
      throw new NotFoundError("Participant not found in conversation");
    }

    // Mark participant as left
    await tx.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: {
        leftAt: new Date(),
      },
    });

    // Create system message about the removal
    const remover = await tx.user.findUnique({
      where: { id: removedByUserId },
      select: { fullName: true },
    });

    const systemMessage = isSelfRemoval
      ? `${
          participant.user.fullName || participant.user.username
        } left the group`
      : `${remover?.fullName || "Someone"} removed ${
          participant.user.fullName || participant.user.username
        } from the group`;

    await tx.message.create({
      data: {
        content: systemMessage,
        type: "SYSTEM",
        senderId: removedByUserId,
        conversationId,
      },
    });

    return { success: true };
  });
};

// Update group conversation details
export const updateGroupConversation = async (
  conversationId: string,
  userId: string,
  updates: { name?: string; description?: string }
) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Check if conversation exists and is a group
    const conversation = await tx.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    if (conversation.type !== "GROUP") {
      throw new ValidationError("Can only update group conversations");
    }

    // Check if user has admin rights
    const participant = await tx.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant || participant.role !== "ADMIN") {
      throw new AuthorizationError("Only admins can update group details");
    }

    // Update conversation
    const updatedConversation = await tx.conversation.update({
      where: { id: conversationId },
      data: {
        ...(updates.name && { name: updates.name.trim() }),
        ...(updates.description !== undefined && {
          description: updates.description?.trim() || null,
        }),
      },
      include: {
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profilePic: true,
              },
            },
          },
        },
      },
    });

    // Create system message about the update
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    });

    if (updates.name) {
      await tx.message.create({
        data: {
          content: `${user?.fullName || "Someone"} changed the group name to "${
            updates.name
          }"`,
          type: "SYSTEM",
          senderId: userId,
          conversationId,
        },
      });
    }

    return updatedConversation;
  });
};

// Send a message to a conversation
export const sendMessage = async (
  senderId: string,
  conversationId: string,
  data: SendMessageData
) => {
  // Validate input data
  const { value: validatedData, error } = validateInput<SendMessageData>(
    messageSchema,
    data
  );
  if (error) {
    throw new ValidationError(error);
  }

  const { content, type = "TEXT" } = validatedData;

  // Check if user is participant in conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: senderId,
      },
    },
  });

  if (!participant) {
    throw new AuthorizationError(
      "You are not a participant in this conversation"
    );
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      content,
      type: type as any,
      senderId,
      conversationId,
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          fullName: true,
          profilePic: true,
        },
      },
    },
  });

  // Update conversation's last message timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return message;
};

// Send direct message (convenience method)
export const sendDirectMessage = async (
  senderId: string,
  receiverId: string,
  data: SendMessageData
) => {
  // Get or create conversation
  const conversation = await getOrCreateDirectConversation(
    senderId,
    receiverId
  );

  // Send message to that conversation
  const message = await sendMessage(senderId, conversation.id, data);

  // Return both message and conversation info
  return {
    message,
    conversationId: conversation.id,
    conversation,
  };
};

// Get messages from a conversation
export const getMessages = async (
  userId: string,
  conversationId: string,
  options: GetMessagesOptions = {}
) => {
  const { page = 1, limit = 20, before, after } = options;

  // Check if user has access to conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!participant) {
    throw new NotFoundError("Conversation not found or you don't have access");
  }

  // Build where clause for pagination
  const whereClause: any = {
    conversationId,
  };

  if (before) {
    whereClause.createdAt = { lt: new Date(before) };
  }
  if (after) {
    whereClause.createdAt = { gt: new Date(after) };
  }

  // Get messages with pagination
  const messages = await prisma.message.findMany({
    where: whereClause,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          fullName: true,
          profilePic: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: (page - 1) * limit,
  });

  // Get total count for pagination
  const totalCount = await prisma.message.count({
    where: { conversationId },
  });

  return {
    messages: messages.reverse(), // Reverse to show oldest first
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
    },
  };
};

// Delete a message (only sender can delete)
export const deleteMessage = async (userId: string, messageId: string) => {
  // Find the message
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      sender: { select: { id: true } },
    },
  });

  if (!message) {
    throw new NotFoundError("Message not found");
  }

  // Check if user is the sender
  if (message.senderId !== userId) {
    throw new AuthorizationError("You can only delete your own messages");
  }

  // Delete the message
  await prisma.message.delete({
    where: { id: messageId },
  });

  return { message: "Message deleted successfully" };
};

// Update a message (only sender can update)
export const updateMessage = async (
  userId: string,
  messageId: string,
  data: { content: string }
) => {
  // Validate input
  if (!data.content || data.content.trim().length === 0) {
    throw new ValidationError("Message content cannot be empty");
  }

  if (data.content.length > 1000) {
    throw new ValidationError("Message content cannot exceed 1000 characters");
  }

  // Find the message
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new NotFoundError("Message not found");
  }

  // Check if user is the sender
  if (message.senderId !== userId) {
    throw new AuthorizationError("You can only edit your own messages");
  }

  // Update the message
  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: {
      content: data.content.trim(),
      updatedAt: new Date(),
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          fullName: true,
          profilePic: true,
        },
      },
    },
  });

  return updatedMessage;
};

// Get user's conversations
export const getUserConversations = async (userId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId: userId,
          leftAt: null, // Only include conversations the user hasn't left
        },
      },
    },
    include: {
      participants: {
        where: {
          leftAt: null, // Only include active participants
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePic: true,
              isOnline: true,
            },
          },
        },
      },
      messages: {
        take: 1, // Only get the latest message for preview
        orderBy: {
          createdAt: "desc",
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return conversations;
};

// Get conversation by ID with participants
export const getConversationById = async (conversationId: string) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        where: { leftAt: null },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePic: true,
              isOnline: true,
            },
          },
        },
      },
    },
  });

  return conversation;
};
