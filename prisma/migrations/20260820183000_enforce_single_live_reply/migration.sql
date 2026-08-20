-- Preserve the oldest live reply if historical races created duplicates.
WITH ranked_replies AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "parentId"
      ORDER BY "createdAt" ASC, "id" ASC
    ) AS reply_rank
  FROM "Message"
  WHERE "parentId" IS NOT NULL
    AND "deletedAt" IS NULL
)
UPDATE "Message" AS message
SET "deletedAt" = CURRENT_TIMESTAMP
FROM ranked_replies
WHERE message."id" = ranked_replies."id"
  AND ranked_replies.reply_rank > 1;

-- PostgreSQL partial uniqueness allows a replacement reply after the old one
-- is soft-deleted while preventing concurrent live duplicates.
CREATE UNIQUE INDEX "Message_one_live_reply_per_parent"
ON "Message"("parentId")
WHERE "parentId" IS NOT NULL
  AND "deletedAt" IS NULL;
