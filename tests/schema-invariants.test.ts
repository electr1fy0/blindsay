import { describe, expect, test } from "bun:test";

const migrationPath =
  "prisma/migrations/20260820183000_enforce_single_live_reply/migration.sql";

describe("reply database invariants", () => {
  test("migration deduplicates existing live replies before adding uniqueness", async () => {
    const sql = await Bun.file(migrationPath).text();
    expect(sql).toContain("ROW_NUMBER() OVER");
    expect(sql).toContain('PARTITION BY "parentId"');
    expect(sql).toContain("reply_rank > 1");
    expect(sql).toContain('SET "deletedAt" = CURRENT_TIMESTAMP');
  });

  test("uses partial uniqueness so soft-deleted replies can be replaced", async () => {
    const sql = await Bun.file(migrationPath).text();
    expect(sql).toContain(
      'CREATE UNIQUE INDEX "Message_one_live_reply_per_parent"',
    );
    expect(sql).toContain('ON "Message"("parentId")');
    expect(sql).toContain('WHERE "parentId" IS NOT NULL');
    expect(sql).toContain('AND "deletedAt" IS NULL');
  });
});
