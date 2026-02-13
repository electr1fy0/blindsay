-- Remove reporting and blocking
ALTER TABLE "Message" DROP COLUMN IF EXISTS "senderHash";
DROP INDEX IF EXISTS "Message_recipientId_senderHash_idx";

DROP TABLE IF EXISTS "MessageReport";
DROP TABLE IF EXISTS "BlockedSender";
