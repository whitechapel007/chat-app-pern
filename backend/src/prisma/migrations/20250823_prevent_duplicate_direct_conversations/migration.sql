-- Add a computed column to store sorted participant IDs for direct conversations
-- This will help prevent duplicate direct conversations between the same two users

-- Note: Since we can't easily create a computed column with Prisma that references
-- another table, we'll handle this constraint at the application level.
-- The cleanup script has already removed duplicates, and the improved
-- getOrCreateDirectConversation function will prevent new duplicates.

-- Add an index to improve performance of direct conversation lookups
CREATE INDEX IF NOT EXISTS idx_conversations_type_direct
ON conversations (type)
WHERE type = 'DIRECT';

-- Add an index to improve participant lookups for active participants
CREATE INDEX IF NOT EXISTS idx_conversation_participants_active
ON conversation_participants (conversation_id, user_id)
WHERE "leftAt" IS NULL;
