import { describe, expect, test } from "bun:test";
import { isPrismaUniqueConstraintError } from "../lib/prisma-errors";

describe("isPrismaUniqueConstraintError", () => {
  test("recognizes Prisma P2002 errors", () => {
    expect(isPrismaUniqueConstraintError({ code: "P2002" })).toBe(true);
    expect(
      isPrismaUniqueConstraintError({ code: "P2002", meta: { target: ["parentId"] } }),
    ).toBe(true);
  });

  test.each([
    null,
    undefined,
    "P2002",
    2002,
    {},
    { code: "P2003" },
    { code: 2002 },
    new Error("P2002"),
  ])("rejects non-P2002 shape %p", (error) => {
    expect(isPrismaUniqueConstraintError(error)).toBe(false);
  });
});
