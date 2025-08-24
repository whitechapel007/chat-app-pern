import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupDuplicateConversations() {
  console.log("Starting cleanup of duplicate direct conversations...");

  try {
    // Find all direct conversations
    const directConversations = await prisma.conversation.findMany({
      where: {
        type: "DIRECT",
      },
      include: {
        participants: {
          where: {
            leftAt: null,
          },
          select: {
            userId: true,
          },
        },
        messages: {
          select: {
            id: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    console.log(`Found ${directConversations.length} direct conversations`);

    // Group conversations by participant pairs
    const conversationGroups = new Map<string, typeof directConversations>();

    for (const conversation of directConversations) {
      if (conversation.participants.length === 2) {
        const participantIds = conversation.participants
          .map((p) => p.userId)
          .sort()
          .join("-");

        if (!conversationGroups.has(participantIds)) {
          conversationGroups.set(participantIds, []);
        }
        conversationGroups.get(participantIds)!.push(conversation);
      }
    }

    console.log(`Found ${conversationGroups.size} unique participant pairs`);

    // Find and merge duplicates
    let duplicatesFound = 0;
    let conversationsDeleted = 0;

    for (const [participantPair, conversations] of conversationGroups) {
      if (conversations.length > 1) {
        duplicatesFound++;
        console.log(
          `Found ${conversations.length} duplicate conversations for participants: ${participantPair}`
        );

        // Sort by creation date to keep the oldest one
        conversations.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const keepConversation = conversations[0];
        const duplicateConversations = conversations.slice(1);

        console.log(
          `Keeping conversation ${keepConversation.id}, removing ${duplicateConversations.length} duplicates`
        );

        // Move all messages from duplicate conversations to the main one
        for (const duplicate of duplicateConversations) {
          if (duplicate.messages.length > 0) {
            console.log(
              `Moving ${duplicate.messages.length} messages from ${duplicate.id} to ${keepConversation.id}`
            );

            await prisma.message.updateMany({
              where: {
                conversationId: duplicate.id,
              },
              data: {
                conversationId: keepConversation.id,
              },
            });
          }

          // Delete the duplicate conversation (participants will be deleted due to cascade)
          await prisma.conversation.delete({
            where: {
              id: duplicate.id,
            },
          });

          conversationsDeleted++;
        }

        // Update the kept conversation's updatedAt timestamp
        await prisma.conversation.update({
          where: {
            id: keepConversation.id,
          },
          data: {
            updatedAt: new Date(),
          },
        });
      }
    }

    console.log(`Cleanup completed:`);
    console.log(`- Found ${duplicatesFound} sets of duplicate conversations`);
    console.log(`- Deleted ${conversationsDeleted} duplicate conversations`);
    console.log(`- Merged messages into remaining conversations`);
  } catch (error) {
    console.error("Error during cleanup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupDuplicateConversations()
    .then(() => {
      console.log("Cleanup completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Cleanup failed:", error);
      process.exit(1);
    });
}

export { cleanupDuplicateConversations };
