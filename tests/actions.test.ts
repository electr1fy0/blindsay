import { beforeEach, describe, expect, mock, test } from "bun:test";
import { MAX_MESSAGE_LENGTH } from "../lib/action-validation";

const getServerSession = mock(async () => null as any);
const revalidatePath = mock((_path: string) => {});
const redirect = mock((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const checkRateLimit = mock(async () => null as any);

const prisma = {
  user: {
    findUnique: mock(async (_args?: any) => null as any),
    update: mock(async (args?: any) => ({ id: args?.where?.id, ...args?.data }) as any),
  },
  message: {
    findFirst: mock(async (_args?: any) => null as any),
    findUnique: mock(async (_args?: any) => null as any),
    create: mock(async (args?: any) => ({ id: "message-1", ...args?.data }) as any),
    update: mock(async (args?: any) => ({ id: args?.where?.id, ...args?.data }) as any),
    updateMany: mock(async (_args?: any) => ({ count: 0 }) as any),
    count: mock(async (_args?: any) => 0),
  },
  session: {
    deleteMany: mock(async (_args?: any) => ({ count: 0 }) as any),
  },
  $transaction: mock(async (ops: any[]) => Promise.all(ops)),
};

mock.module("@/lib/prisma", () => ({ prisma }));
mock.module("next-auth", () => ({ getServerSession }));
mock.module("next/cache", () => ({ revalidatePath }));
mock.module("next/navigation", () => ({ redirect }));
mock.module("@/lib/rate-limit", () => ({ checkRateLimit }));

const actions = await import("../app/actions");

function signInAs(id = "owner-1") {
  getServerSession.mockImplementation(async () => ({ user: { id } }));
}

function validReplyParent(recipientId = "owner") {
  return {
    recipientId,
    parentId: null,
    deletedAt: null,
  };
}

beforeEach(() => {
  getServerSession.mockClear();
  getServerSession.mockImplementation(async () => null);
  revalidatePath.mockClear();
  redirect.mockClear();
  checkRateLimit.mockClear();
  checkRateLimit.mockImplementation(async () => null);

  prisma.user.findUnique.mockClear();
  prisma.user.findUnique.mockImplementation(async () => null);
  prisma.user.update.mockClear();
  prisma.user.update.mockImplementation(async (args?: any) => ({ id: args?.where?.id, ...args?.data }));

  prisma.message.findFirst.mockClear();
  prisma.message.findFirst.mockImplementation(async () => null);
  prisma.message.findUnique.mockClear();
  prisma.message.findUnique.mockImplementation(async () => null);
  prisma.message.create.mockClear();
  prisma.message.create.mockImplementation(async (args?: any) => ({ id: "message-1", ...args?.data }));
  prisma.message.update.mockClear();
  prisma.message.update.mockImplementation(async (args?: any) => ({ id: args?.where?.id, ...args?.data }));
  prisma.message.updateMany.mockClear();
  prisma.message.updateMany.mockImplementation(async () => ({ count: 0 }));
  prisma.message.count.mockClear();
  prisma.message.count.mockImplementation(async () => 0);

  prisma.session.deleteMany.mockClear();
  prisma.session.deleteMany.mockImplementation(async () => ({ count: 0 }));
  prisma.$transaction.mockClear();
  prisma.$transaction.mockImplementation(async (ops: any[]) => Promise.all(ops));
});

describe("createAnonymousMessage", () => {
  test("rejects rate-limited senders before touching the database", async () => {
    checkRateLimit.mockImplementation(async () => ({ success: false, remaining: 0 }));

    const result = await actions.createAnonymousMessage("recipient", "alice", "hello");

    expect(result).toEqual({
      success: false,
      message: "You're sending too fast. Please wait a moment before trying again.",
    });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  test("allows a successful rate-limit check", async () => {
    checkRateLimit.mockImplementation(async () => ({ success: true, remaining: 4 }));
    prisma.user.findUnique.mockImplementation(async () => ({
      inboxOpen: true,
      inboxPausedUntil: null,
      hiddenWords: [],
      deletedAt: null,
    }));

    expect(await actions.createAnonymousMessage("recipient", "alice", "hello")).toEqual({ success: true });
  });

  test("rejects an empty string", async () => {
    const result = await actions.createAnonymousMessage("recipient", "alice", "");
    expect(result).toEqual({ success: false, message: "Content cannot be empty" });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  test("rejects whitespace-only content", async () => {
    const result = await actions.createAnonymousMessage("recipient", "alice", " \n\t ");
    expect(result).toEqual({ success: false, message: "Content cannot be empty" });
  });

  test("rejects content over the server-side maximum", async () => {
    const result = await actions.createAnonymousMessage(
      "recipient",
      "alice",
      "x".repeat(MAX_MESSAGE_LENGTH + 1),
    );
    expect(result).toEqual({
      success: false,
      message: `Content must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
    });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  test("rejects blocked words case-insensitively", async () => {
    const result = await actions.createAnonymousMessage("recipient", "alice", "contains HaTeWoRd here");
    expect(result).toEqual({ success: false, message: "Please remove abusive language." });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  test("rejects a missing recipient", async () => {
    prisma.user.findUnique.mockImplementation(async () => null);
    const result = await actions.createAnonymousMessage("missing", "ghost", "hello");
    expect(result).toEqual({ success: false, message: "Recipient not found." });
  });

  test("rejects a soft-deleted recipient", async () => {
    prisma.user.findUnique.mockImplementation(async () => ({
      inboxOpen: true,
      inboxPausedUntil: null,
      hiddenWords: [],
      deletedAt: new Date(),
    }));
    const result = await actions.createAnonymousMessage("recipient", "alice", "hello");
    expect(result).toEqual({ success: false, message: "Recipient not found." });
  });

  test("rejects a closed inbox", async () => {
    prisma.user.findUnique.mockImplementation(async () => ({
      inboxOpen: false,
      inboxPausedUntil: null,
      hiddenWords: [],
      deletedAt: null,
    }));
    const result = await actions.createAnonymousMessage("recipient", "alice", "hello");
    expect(result).toEqual({ success: false, message: "This inbox is currently closed." });
  });

  test("rejects an inbox paused into the future", async () => {
    prisma.user.findUnique.mockImplementation(async () => ({
      inboxOpen: true,
      inboxPausedUntil: new Date(Date.now() + 60_000),
      hiddenWords: [],
      deletedAt: null,
    }));
    const result = await actions.createAnonymousMessage("recipient", "alice", "hello");
    expect(result).toEqual({
      success: false,
      message: "This inbox is temporarily paused. Please try again later.",
    });
  });

  test("allows an expired inbox pause", async () => {
    prisma.user.findUnique.mockImplementation(async () => ({
      inboxOpen: true,
      inboxPausedUntil: new Date(Date.now() - 60_000),
      hiddenWords: [],
      deletedAt: null,
    }));
    const result = await actions.createAnonymousMessage("recipient", "alice", "hello");
    expect(result).toEqual({ success: true });
    expect(prisma.message.create).toHaveBeenCalledTimes(1);
  });

  test("normalizes hidden words before matching", async () => {
    prisma.user.findUnique.mockImplementation(async () => ({
      inboxOpen: true,
      inboxPausedUntil: null,
      hiddenWords: ["  Secret  ", ""],
      deletedAt: null,
    }));
    const result = await actions.createAnonymousMessage("recipient", "alice", "my SECRET phrase");
    expect(result).toEqual({ success: false, message: "Your message contains a blocked word." });
    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  test("ignores empty hidden-word entries", async () => {
    prisma.user.findUnique.mockImplementation(async () => ({
      inboxOpen: true,
      inboxPausedUntil: null,
      hiddenWords: ["", "   "],
      deletedAt: null,
    }));
    expect(await actions.createAnonymousMessage("recipient", "alice", "hello")).toEqual({ success: true });
  });

  test("persists the original content and revalidates the recipient profile", async () => {
    prisma.user.findUnique.mockImplementation(async () => ({
      inboxOpen: true,
      inboxPausedUntil: null,
      hiddenWords: [],
      deletedAt: null,
    }));

    const result = await actions.createAnonymousMessage("recipient", "Alice_Name", "  hello there  ");

    expect(result).toEqual({ success: true });
    expect(prisma.message.create).toHaveBeenCalledWith({
      data: { content: "  hello there  ", recipientId: "recipient" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/Alice_Name");
  });
});

describe("createReplyMessage", () => {
  test("requires authentication", async () => {
    expect(await actions.createReplyMessage("owner", "alice", "parent", "reply")).toEqual({
      success: false,
      message: "You must be signed in.",
    });
    expect(prisma.message.findUnique).not.toHaveBeenCalled();
    expect(prisma.message.findFirst).not.toHaveBeenCalled();
  });

  test("rejects replying on behalf of another recipient", async () => {
    signInAs("owner-a");
    expect(await actions.createReplyMessage("owner-b", "alice", "parent", "reply")).toEqual({
      success: false,
      message: "You cannot reply to this message.",
    });
    expect(prisma.message.findUnique).not.toHaveBeenCalled();
  });

  test("rejects invalid content before querying the parent", async () => {
    signInAs("owner");
    expect(await actions.createReplyMessage("owner", "alice", "parent", "  ")).toEqual({
      success: false,
      message: "Content cannot be empty",
    });
    expect(prisma.message.findUnique).not.toHaveBeenCalled();
  });

  test("rejects overlong content before querying the parent", async () => {
    signInAs("owner");
    expect(
      await actions.createReplyMessage(
        "owner",
        "alice",
        "parent",
        "x".repeat(MAX_MESSAGE_LENGTH + 1),
      ),
    ).toEqual({
      success: false,
      message: `Content must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
    });
    expect(prisma.message.findUnique).not.toHaveBeenCalled();
  });

  test("rejects a missing parent", async () => {
    signInAs("owner");
    expect(await actions.createReplyMessage("owner", "alice", "missing", "reply")).toEqual({
      success: false,
      message: "You cannot reply to this message.",
    });
    expect(prisma.message.findFirst).not.toHaveBeenCalled();
  });

  test("rejects a parent owned by another recipient", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => validReplyParent("other"));
    expect(await actions.createReplyMessage("owner", "alice", "parent", "reply")).toEqual({
      success: false,
      message: "You cannot reply to this message.",
    });
  });

  test("rejects replying to an existing reply", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => ({
      recipientId: "owner",
      parentId: "root",
      deletedAt: null,
    }));
    expect(await actions.createReplyMessage("owner", "alice", "reply-parent", "reply")).toEqual({
      success: false,
      message: "You cannot reply to this message.",
    });
  });

  test("rejects replying to a soft-deleted parent", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => ({
      recipientId: "owner",
      parentId: null,
      deletedAt: new Date(),
    }));
    expect(await actions.createReplyMessage("owner", "alice", "parent", "reply")).toEqual({
      success: false,
      message: "You cannot reply to this message.",
    });
  });

  test("queries the parent with ownership and hierarchy fields", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => validReplyParent());
    await actions.createReplyMessage("owner", "alice", "parent", "reply");
    expect(prisma.message.findUnique).toHaveBeenCalledWith({
      where: { id: "parent" },
      select: { recipientId: true, parentId: true, deletedAt: true },
    });
  });

  test("rejects a second live reply", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => validReplyParent());
    prisma.message.findFirst.mockImplementation(async () => ({ id: "existing-reply" }));

    expect(await actions.createReplyMessage("owner", "alice", "parent", "reply")).toEqual({
      success: false,
      message: "Only one reply is allowed.",
    });
    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  test("checks only non-deleted replies for duplication", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => validReplyParent());
    await actions.createReplyMessage("owner", "alice", "parent", "reply");
    expect(prisma.message.findFirst).toHaveBeenCalledWith({
      where: { recipientId: "owner", parentId: "parent", deletedAt: null },
      select: { id: true },
    });
  });

  test("maps a database uniqueness race to the duplicate-reply response", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => validReplyParent());
    prisma.message.create.mockImplementation(async () => {
      throw { code: "P2002" };
    });

    expect(await actions.createReplyMessage("owner", "alice", "parent", "reply")).toEqual({
      success: false,
      message: "Only one reply is allowed.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("rethrows unexpected database failures", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => validReplyParent());
    prisma.message.create.mockImplementation(async () => {
      throw new Error("database unavailable");
    });

    await expect(
      actions.createReplyMessage("owner", "alice", "parent", "reply"),
    ).rejects.toThrow("database unavailable");
  });

  test("creates a reply and returns it", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => validReplyParent());
    prisma.message.create.mockImplementation(async (args?: any) => ({ id: "reply-1", ...args.data }));

    const result = await actions.createReplyMessage("owner", "alice", "parent", "thanks");

    expect(result).toEqual({
      success: true,
      reply: { id: "reply-1", content: "thanks", recipientId: "owner", parentId: "parent" },
    });
    expect(prisma.message.create).toHaveBeenCalledWith({
      data: { content: "thanks", recipientId: "owner", parentId: "parent" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/alice");
  });
});

describe("updateReplyMessage", () => {
  test("requires authentication", async () => {
    expect(await actions.updateReplyMessage("reply", "alice", "edited")).toEqual({
      success: false,
      message: "You must be signed in.",
    });
  });

  test("rejects empty content before looking up the reply", async () => {
    signInAs("owner");
    expect(await actions.updateReplyMessage("reply", "alice", "\t")).toEqual({
      success: false,
      message: "Content cannot be empty",
    });
    expect(prisma.message.findUnique).not.toHaveBeenCalled();
  });

  test("rejects overlong content before looking up the reply", async () => {
    signInAs("owner");
    expect(
      await actions.updateReplyMessage(
        "reply",
        "alice",
        "x".repeat(MAX_MESSAGE_LENGTH + 1),
      ),
    ).toEqual({
      success: false,
      message: `Content must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
    });
    expect(prisma.message.findUnique).not.toHaveBeenCalled();
  });

  test("rejects a missing reply", async () => {
    signInAs("owner");
    expect(await actions.updateReplyMessage("missing", "alice", "edited")).toEqual({
      success: false,
      message: "You cannot edit this reply.",
    });
  });

  test("rejects editing a root message", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => ({ recipientId: "owner", parentId: null, deletedAt: null }));
    expect(await actions.updateReplyMessage("root", "alice", "edited")).toEqual({
      success: false,
      message: "You cannot edit this reply.",
    });
  });

  test("rejects editing another user's reply", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => ({ recipientId: "someone-else", parentId: "parent", deletedAt: null }));
    expect(await actions.updateReplyMessage("reply", "alice", "edited")).toEqual({
      success: false,
      message: "You cannot edit this reply.",
    });
  });

  test("rejects editing a soft-deleted reply", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => ({
      recipientId: "owner",
      parentId: "parent",
      deletedAt: new Date(),
    }));
    expect(await actions.updateReplyMessage("reply", "alice", "edited")).toEqual({
      success: false,
      message: "You cannot edit this reply.",
    });
    expect(prisma.message.update).not.toHaveBeenCalled();
  });

  test("updates an owned reply", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => ({ recipientId: "owner", parentId: "parent", deletedAt: null }));

    expect(await actions.updateReplyMessage("reply", "alice", "edited")).toEqual({ success: true });
    expect(prisma.message.update).toHaveBeenCalledWith({
      where: { id: "reply" },
      data: { content: "edited" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/alice");
  });
});

describe("setUsername", () => {
  test("requires authentication", async () => {
    expect(await actions.setUsername("alice")).toEqual({
      success: false,
      message: "You must be signed in.",
    });
  });

  test("normalizes before checking reserved names", async () => {
    signInAs();
    const result = await actions.setUsername("  ACCOUNT  ");
    expect(result).toEqual({ success: false, message: "That username is reserved." });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  test.each([
    ["ab", "too short"],
    ["abcdefghijklmnop", "too long"],
    ["alice-name", "hyphen"],
    ["alice.name", "dot"],
    ["álîce", "non-ascii"],
    ["white space", "space"],
  ])("rejects invalid username %s (%s)", async (username) => {
    signInAs();
    const result = await actions.setUsername(username);
    expect(result).toEqual({
      success: false,
      message: "Username must be 3-15 characters and use letters, numbers, or underscores.",
    });
  });

  test("rejects a username owned by another user", async () => {
    signInAs("owner");
    prisma.user.findUnique.mockImplementation(async () => ({ id: "someone-else" }));
    expect(await actions.setUsername("Alice_1")).toEqual({
      success: false,
      message: "That username is already taken.",
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { username: "alice_1" },
      select: { id: true },
    });
  });

  test("allows retaining the current user's username", async () => {
    signInAs("owner");
    prisma.user.findUnique.mockImplementation(async () => ({ id: "owner" }));
    prisma.user.update.mockImplementation(async () => ({ id: "owner", username: "alice_1" }));

    await expect(actions.setUsername(" Alice_1 ")).rejects.toThrow("NEXT_REDIRECT:/alice_1");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "owner" },
      data: { username: "alice_1" },
    });
  });

  test("stores a normalized username then redirects to it", async () => {
    signInAs("owner");
    prisma.user.update.mockImplementation(async () => ({ id: "owner", username: "alice_123" }));

    await expect(actions.setUsername("  ALICE_123  ")).rejects.toThrow("NEXT_REDIRECT:/alice_123");
    expect(redirect).toHaveBeenCalledWith("/alice_123");
  });
});

describe("deleteMessage", () => {
  test("requires authentication", async () => {
    expect(await actions.deleteMessage("message", "alice")).toEqual({
      success: false,
      message: "You must be signed in.",
    });
  });

  test("rejects a missing message", async () => {
    signInAs();
    expect(await actions.deleteMessage("missing", "alice")).toEqual({
      success: false,
      message: "You cannot delete this message.",
    });
  });

  test("rejects deleting another user's message", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => ({ recipientId: "other", parentId: null }));
    expect(await actions.deleteMessage("message", "alice")).toEqual({
      success: false,
      message: "You cannot delete this message.",
    });
  });

  test("soft-deletes a root message and all replies in one transaction", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => ({ recipientId: "owner", parentId: null }));

    expect(await actions.deleteMessage("root", "alice")).toEqual({ success: true });
    expect(prisma.message.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.message.update).toHaveBeenCalledTimes(1);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);

    const updateManyArg = prisma.message.updateMany.mock.calls[0][0];
    const updateArg = prisma.message.update.mock.calls[0][0];
    expect(updateManyArg.where).toEqual({ parentId: "root" });
    expect(updateArg.where).toEqual({ id: "root" });
    expect(updateManyArg.data.deletedAt).toBeInstanceOf(Date);
    expect(updateArg.data.deletedAt.getTime()).toBe(updateManyArg.data.deletedAt.getTime());
    expect(revalidatePath).toHaveBeenCalledWith("/alice");
  });

  test("soft-deletes only the selected reply", async () => {
    signInAs("owner");
    prisma.message.findUnique.mockImplementation(async () => ({ recipientId: "owner", parentId: "root" }));

    expect(await actions.deleteMessage("reply", "alice")).toEqual({ success: true });
    expect(prisma.message.updateMany).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.message.update).toHaveBeenCalledWith({
      where: { id: "reply" },
      data: { deletedAt: expect.any(Date) },
    });
  });
});

describe("deleteAccount", () => {
  test("requires authentication", async () => {
    expect(await actions.deleteAccount()).toEqual({
      success: false,
      message: "You must be signed in.",
    });
  });

  test("deletes sessions and soft-deletes the account transactionally", async () => {
    signInAs("owner");
    expect(await actions.deleteAccount()).toEqual({ success: true });

    expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: "owner" } });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "owner" },
      data: { deletedAt: expect.any(Date), username: null },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});

describe("updateHiddenWords", () => {
  test("requires authentication", async () => {
    expect(await actions.updateHiddenWords(["secret"])).toEqual({
      success: false,
      message: "You must be signed in.",
    });
  });

  test("trims, lowercases, removes blanks, and deduplicates", async () => {
    signInAs("owner");
    expect(await actions.updateHiddenWords(["  Alpha ", "", "  ", "BETA", "ALPHA"])).toEqual({ success: true });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "owner" },
      data: { hiddenWords: ["alpha", "beta"] },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/account");
  });

  test("caps the stored list at 50 unique entries", async () => {
    signInAs("owner");
    const words = Array.from({ length: 70 }, (_, index) => ` WORD_${index} `);
    await actions.updateHiddenWords(words);
    const stored = prisma.user.update.mock.calls[0][0].data.hiddenWords;
    expect(stored).toHaveLength(50);
    expect(stored[0]).toBe("word_0");
    expect(stored[49]).toBe("word_49");
  });
});

describe("pauseInbox", () => {
  test("requires authentication", async () => {
    expect(await actions.pauseInbox(4)).toEqual({
      success: false,
      message: "You must be signed in.",
    });
  });

  test("floors fractional hours", async () => {
    signInAs("owner");
    const originalNow = Date.now;
    Date.now = () => 1_700_000_000_000;
    try {
      await actions.pauseInbox(2.9);
      const until = prisma.user.update.mock.calls[0][0].data.inboxPausedUntil as Date;
      expect(until.getTime()).toBe(1_700_000_000_000 + 2 * 60 * 60 * 1000);
    } finally {
      Date.now = originalNow;
    }
  });

  test("clamps values below one hour", async () => {
    signInAs("owner");
    const originalNow = Date.now;
    Date.now = () => 1_700_000_000_000;
    try {
      await actions.pauseInbox(-100);
      const until = prisma.user.update.mock.calls[0][0].data.inboxPausedUntil as Date;
      expect(until.getTime()).toBe(1_700_000_000_000 + 60 * 60 * 1000);
    } finally {
      Date.now = originalNow;
    }
  });

  test("normalizes NaN to the minimum pause instead of storing an invalid date", async () => {
    signInAs("owner");
    const originalNow = Date.now;
    Date.now = () => 1_700_000_000_000;
    try {
      await actions.pauseInbox(Number.NaN);
      const until = prisma.user.update.mock.calls[0][0].data.inboxPausedUntil as Date;
      expect(until.getTime()).toBe(1_700_000_000_000 + 60 * 60 * 1000);
      expect(Number.isNaN(until.getTime())).toBe(false);
    } finally {
      Date.now = originalNow;
    }
  });

  test("clamps values above 720 hours", async () => {
    signInAs("owner");
    const originalNow = Date.now;
    Date.now = () => 1_700_000_000_000;
    try {
      await actions.pauseInbox(10_000);
      const until = prisma.user.update.mock.calls[0][0].data.inboxPausedUntil as Date;
      expect(until.getTime()).toBe(1_700_000_000_000 + 720 * 60 * 60 * 1000);
    } finally {
      Date.now = originalNow;
    }
  });
});

describe("clearInboxPause", () => {
  test("requires authentication", async () => {
    expect(await actions.clearInboxPause()).toEqual({
      success: false,
      message: "You must be signed in.",
    });
  });

  test("clears the pause and revalidates account settings", async () => {
    signInAs("owner");
    expect(await actions.clearInboxPause()).toEqual({ success: true });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "owner" },
      data: { inboxPausedUntil: null },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/account");
  });
});

describe("toggleInboxOpen", () => {
  test("requires authentication", async () => {
    expect(await actions.toggleInboxOpen()).toEqual({
      success: false,
      message: "You must be signed in.",
    });
  });

  test("treats a missing authenticated user as unauthorized", async () => {
    signInAs("deleted-user");
    prisma.user.findUnique.mockImplementation(async () => null);
    expect(await actions.toggleInboxOpen()).toEqual({
      success: false,
      message: "You must be signed in.",
    });
  });

  test("closes an open inbox", async () => {
    signInAs("owner");
    prisma.user.findUnique.mockImplementation(async () => ({ inboxOpen: true }));
    expect(await actions.toggleInboxOpen()).toEqual({ success: true });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "owner" },
      data: { inboxOpen: false },
    });
  });

  test("opens a closed inbox", async () => {
    signInAs("owner");
    prisma.user.findUnique.mockImplementation(async () => ({ inboxOpen: false }));
    await actions.toggleInboxOpen();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "owner" },
      data: { inboxOpen: true },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/account");
  });
});

describe("getUserSettings", () => {
  test("returns null without a session", async () => {
    expect(await actions.getUserSettings()).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  test("queries only the settings fields for the authenticated user", async () => {
    signInAs("owner");
    const settings = { id: "owner", username: "alice", inboxOpen: true };
    prisma.user.findUnique.mockImplementation(async () => settings);

    expect(await actions.getUserSettings()).toBe(settings);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "owner" },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        image: true,
        inboxOpen: true,
        inboxPausedUntil: true,
        hiddenWords: true,
      },
    });
  });
});

describe("checkForNewMessages", () => {
  test("returns false without an authenticated user", async () => {
    expect(await actions.checkForNewMessages(new Date(0))).toEqual({ hasNew: false });
    expect(prisma.message.count).not.toHaveBeenCalled();
  });

  test("returns false when no newer live root messages exist", async () => {
    signInAs("owner");
    prisma.message.count.mockImplementation(async () => 0);
    const since = new Date("2026-01-01T00:00:00.000Z");

    expect(await actions.checkForNewMessages(since)).toEqual({ hasNew: false });
    expect(prisma.message.count).toHaveBeenCalledWith({
      where: {
        recipientId: "owner",
        createdAt: { gt: since },
        parentId: null,
        deletedAt: null,
      },
    });
  });

  test("returns true when at least one newer live root message exists", async () => {
    signInAs("owner");
    prisma.message.count.mockImplementation(async () => 3);
    expect(await actions.checkForNewMessages(new Date(0))).toEqual({ hasNew: true });
  });
});
