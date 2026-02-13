-- Add moderation and inbox controls
ALTER TABLE "User" ADD COLUMN "hiddenWords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN "inboxPausedUntil" TIMESTAMP(3);

ALTER TABLE "Message" ADD COLUMN "senderHash" TEXT;
CREATE INDEX "Message_recipientId_senderHash_idx" ON "Message"("recipientId", "senderHash");

CREATE TABLE "BlockedSender" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "senderHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BlockedSender_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlockedSender_userId_senderHash_key" ON "BlockedSender"("userId", "senderHash");
CREATE INDEX "BlockedSender_userId_idx" ON "BlockedSender"("userId");

ALTER TABLE "BlockedSender" ADD CONSTRAINT "BlockedSender_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
