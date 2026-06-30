-- CreateIndex
CREATE INDEX "Message_recipientId_createdAt_idx" ON "Message"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_recipientId_parentId_idx" ON "Message"("recipientId", "parentId");

-- CreateIndex
CREATE INDEX "Message_parentId_idx" ON "Message"("parentId");
