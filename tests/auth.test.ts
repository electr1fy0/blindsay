import { beforeEach, describe, expect, mock, test } from "bun:test";

const findUnique = mock(async (_args?: any) => null as any);
const update = mock(async (_args?: any) => ({} as any));
const prisma = { user: { findUnique, update } };

const PrismaAdapter = mock((_client: any) => ({ name: "mock-prisma-adapter" }));
const GoogleProvider = mock((options: any) => ({ id: "google", options }));

mock.module("@/lib/prisma", () => ({ prisma }));
mock.module("@next-auth/prisma-adapter", () => ({ PrismaAdapter }));
mock.module("next-auth/providers/google", () => ({ default: GoogleProvider }));

const { authOptions } = await import("../auth");

beforeEach(() => {
  findUnique.mockClear();
  findUnique.mockImplementation(async () => null);
  update.mockClear();
  update.mockImplementation(async () => ({}));
});

describe("auth configuration", () => {
  test("uses the Prisma adapter", () => {
    expect(PrismaAdapter).toHaveBeenCalledTimes(1);
    expect(PrismaAdapter).toHaveBeenCalledWith(prisma);
    expect(authOptions.adapter).toEqual({ name: "mock-prisma-adapter" });
  });

  test("configures Google with empty-string fallbacks when env vars are absent", () => {
    expect(GoogleProvider).toHaveBeenCalledTimes(1);
    const options = GoogleProvider.mock.calls[0][0];
    expect(typeof options.clientId).toBe("string");
    expect(typeof options.clientSecret).toBe("string");
  });
});

describe("signIn callback", () => {
  const signIn = authOptions.callbacks!.signIn!;

  test("allows users without an email without querying the database", async () => {
    const result = await signIn({ user: { id: "u1" } } as any);
    expect(result).toBe(true);
    expect(findUnique).not.toHaveBeenCalled();
  });

  test("looks up users by email", async () => {
    await signIn({ user: { id: "u1", email: "alice@example.com" } } as any);
    expect(findUnique).toHaveBeenCalledWith({
      where: { email: "alice@example.com" },
      select: { id: true, deletedAt: true },
    });
  });

  test("allows a new email address without creating restoration work", async () => {
    findUnique.mockImplementation(async () => null);
    expect(await signIn({ user: { id: "u1", email: "new@example.com" } } as any)).toBe(true);
    expect(update).not.toHaveBeenCalled();
  });

  test("leaves active existing users unchanged", async () => {
    findUnique.mockImplementation(async () => ({ id: "u1", deletedAt: null }));
    expect(await signIn({ user: { id: "u1", email: "active@example.com" } } as any)).toBe(true);
    expect(update).not.toHaveBeenCalled();
  });

  test("restores a soft-deleted account on sign in", async () => {
    findUnique.mockImplementation(async () => ({
      id: "u1",
      deletedAt: new Date("2026-01-01T00:00:00.000Z"),
    }));

    expect(await signIn({ user: { id: "u1", email: "returning@example.com" } } as any)).toBe(true);
    expect(update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { deletedAt: null },
    });
  });
});

describe("session callback", () => {
  const sessionCallback = authOptions.callbacks!.session!;

  test("copies database id and username into the session user", async () => {
    const session = { user: { name: "Alice", email: "alice@example.com" }, expires: "2099-01-01" };
    const result = await sessionCallback({
      session,
      user: { id: "db-user", username: "alice" },
    } as any);

    expect(result).toBe(session);
    expect((result.user as any).id).toBe("db-user");
    expect((result.user as any).username).toBe("alice");
  });

  test("supports a null username", async () => {
    const session = { user: { name: "Alice" }, expires: "2099-01-01" };
    const result = await sessionCallback({
      session,
      user: { id: "db-user", username: null },
    } as any);

    expect((result.user as any).id).toBe("db-user");
    expect((result.user as any).username).toBeNull();
  });

  test("leaves sessions without a user object untouched", async () => {
    const session = { user: undefined, expires: "2099-01-01" };
    const result = await sessionCallback({
      session,
      user: { id: "db-user", username: "alice" },
    } as any);

    expect(result).toEqual(session);
  });
});
