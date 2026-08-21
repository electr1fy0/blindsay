import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, findOne, textContent } from "./react-tree";

const notFound = mock(() => {
  throw new Error("NEXT_NOT_FOUND");
});
const getServerSession = mock(async () => null as any);
const userFindUnique = mock(async (_args?: any) => null as any);
const messageCount = mock(async (_args?: any) => 0);
const messageFindMany = mock(async (_args?: any) => [] as any[]);

const LinkMock = (_props: any) => null;
const CreateMessageFormMock = (_props: any) => null;
const MessageCardMock = (_props: any) => null;
const MarkMessagesSeenMock = (_props: any) => null;
const AutoRefreshMock = (_props: any) => null;
const SharePanelMock = (_props: any) => null;
const ThemeToggleMock = (_props: any) => null;

mock.module("next/navigation", () => ({ notFound }));
mock.module("next/link", () => ({ default: LinkMock }));
mock.module("next-auth", () => ({ getServerSession }));
mock.module("@/auth", () => ({ authOptions: {} }));
mock.module("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: userFindUnique },
    message: { count: messageCount, findMany: messageFindMany },
  },
}));
mock.module("@/components/create-message-form", () => ({
  CreateMessageForm: CreateMessageFormMock,
}));
mock.module("@/components/message-card", () => ({ MessageCard: MessageCardMock }));
mock.module("@/components/new-badge", () => ({
  MarkMessagesSeen: MarkMessagesSeenMock,
}));
mock.module("@/components/auto-refresh", () => ({ AutoRefresh: AutoRefreshMock }));
mock.module("@/components/share-panel", () => ({ SharePanel: SharePanelMock }));
mock.module("@/components/theme-toggle", () => ({ ThemeToggle: ThemeToggleMock }));

const pageModule = await import("../app/(app)/[username]/page");
const UserInboxPage = pageModule.default;
const { generateMetadata } = pageModule;

const profile = {
  id: "owner-1",
  username: "alice",
  name: "Alice",
  inboxOpen: true,
  inboxPausedUntil: null,
};

function rootMessage(id: string, reply: any = null) {
  return {
    id,
    content: `message ${id}`,
    createdAt: new Date("2026-08-20T00:00:00Z"),
    deletedAt: null,
    parentId: null,
    recipientId: "owner-1",
    replies: reply ? [reply] : [],
  };
}

beforeEach(() => {
  notFound.mockClear();
  getServerSession.mockClear();
  getServerSession.mockImplementation(async () => null);
  userFindUnique.mockClear();
  userFindUnique.mockImplementation(async () => ({ ...profile }));
  messageCount.mockClear();
  messageCount.mockImplementation(async () => 0);
  messageFindMany.mockClear();
  messageFindMany.mockImplementation(async () => []);
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_URL;
});

describe("generateMetadata", () => {
  test("returns empty metadata when username is absent", async () => {
    expect(await generateMetadata({ params: Promise.resolve({}) })).toEqual({});
  });

  test("normalizes username casing in canonical and social metadata", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://blindsay.example////";
    const metadata = await generateMetadata({
      params: Promise.resolve({ username: "Alice_One" }),
    });

    expect(metadata.title).toBe("Leave a note for @alice_one");
    expect(metadata.alternates).toEqual({
      canonical: "https://blindsay.example/alice_one",
    });
    expect(metadata.openGraph?.url).toBe("https://blindsay.example/alice_one");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://blindsay.example/api/og/alice_one",
        width: 1200,
        height: 630,
        alt: "@alice_one on Blindsay",
      },
    ]);
    expect(metadata.twitter?.images).toEqual([
      "https://blindsay.example/api/og/alice_one",
    ]);
  });

  test("falls back from a blank public URL to Vercel", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "   ";
    process.env.VERCEL_URL = "preview.example.vercel.app/";
    const metadata = await generateMetadata({
      params: Promise.resolve({ username: "ALICE" }),
    });
    expect(metadata.alternates).toEqual({
      canonical: "https://preview.example.vercel.app/alice",
    });
  });
});

describe("routing and profile lookup", () => {
  test("notFound is triggered before auth/database work when username is missing", async () => {
    await expect(UserInboxPage({ params: Promise.resolve({}) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(getServerSession).not.toHaveBeenCalled();
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  test("lowercases the username for the profile query", async () => {
    await UserInboxPage({ params: Promise.resolve({ username: "ALIce_9" }) });
    expect(userFindUnique).toHaveBeenCalledWith({
      where: { username: "alice_9" },
      select: {
        id: true,
        username: true,
        name: true,
        inboxOpen: true,
        inboxPausedUntil: true,
      },
    });
  });

  test("notFound is triggered for a missing profile", async () => {
    userFindUnique.mockImplementation(async () => null);
    await expect(
      UserInboxPage({ params: Promise.resolve({ username: "ghost" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

describe("visitor query and rendering", () => {
  test("requires a live non-deleted reply in the visitor message query", async () => {
    await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(messageFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          recipientId: "owner-1",
          parentId: null,
          deletedAt: null,
          replies: { some: { deletedAt: null } },
        },
      }),
    );
  });

  test("includes only the first live reply ordered oldest-first", async () => {
    await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(messageFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          replies: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      }),
    );
  });

  test("does not let visitor page parameters skip public messages", async () => {
    await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ page: "999" }),
    });
    expect(messageFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 12 }),
    );
  });

  test("renders the send form while inbox is open and unpaused", async () => {
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    const form = findOne(tree, (node) => node.type === CreateMessageFormMock);
    expect(form.props).toEqual({
      recipientId: "owner-1",
      recipientUsername: "alice",
    });
  });

  test("does not render the send form while inbox is closed", async () => {
    userFindUnique.mockImplementation(async () => ({ ...profile, inboxOpen: false }));
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(findAll(tree, (node) => node.type === CreateMessageFormMock)).toHaveLength(0);
    expect(textContent(tree)).toContain("This inbox is currently closed.");
  });

  test("does not render the send form while inbox is paused", async () => {
    userFindUnique.mockImplementation(async () => ({
      ...profile,
      inboxPausedUntil: new Date(Date.now() + 60_000),
    }));
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(findAll(tree, (node) => node.type === CreateMessageFormMock)).toHaveLength(0);
    expect(textContent(tree)).toContain("This inbox is paused");
  });

  test("renders only messages that actually contain a returned live reply", async () => {
    const reply = { id: "r1", content: "reply" };
    messageFindMany.mockImplementation(async () => [
      rootMessage("m1", reply),
      rootMessage("m2"),
    ]);
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    const cards = findAll(tree, (node) => node.type === MessageCardMock);
    expect(cards).toHaveLength(1);
    expect(cards[0].props.message.id).toBe("m1");
    expect(cards[0].props.reply).toBe(reply);
    expect(cards[0].props.isOwner).toBe(false);
  });

  test("shows the public empty state when no live replies are returned", async () => {
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(textContent(tree)).toContain("No replies yet. Be the first to leave a note.");
  });
});

describe("owner query and pagination", () => {
  beforeEach(() => {
    getServerSession.mockImplementation(async () => ({ user: { id: "owner-1" } }));
  });

  test("all filter includes root messages regardless of reply state", async () => {
    await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ filter: "all" }),
    });
    expect(messageFindMany.mock.calls[0][0].where).toEqual({
      recipientId: "owner-1",
      parentId: null,
      deletedAt: null,
    });
  });

  test("unknown filters fall back to all", async () => {
    await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ filter: "private" }),
    });
    expect(messageFindMany.mock.calls[0][0].where).toEqual({
      recipientId: "owner-1",
      parentId: null,
      deletedAt: null,
    });
  });

  test("published filter requires a live reply for total and page queries", async () => {
    await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ filter: "published" }),
    });
    expect(messageCount.mock.calls[0][0].where).toEqual({
      recipientId: "owner-1",
      parentId: null,
      deletedAt: null,
      replies: { some: { deletedAt: null } },
    });
    expect(messageFindMany.mock.calls[0][0].where).toEqual({
      recipientId: "owner-1",
      parentId: null,
      deletedAt: null,
      replies: { some: { deletedAt: null } },
    });
  });

  test("published counter excludes soft-deleted replies", async () => {
    await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(messageCount.mock.calls[1][0].where).toEqual({
      recipientId: "owner-1",
      parentId: null,
      deletedAt: null,
      replies: { some: { deletedAt: null } },
    });
  });

  test("uses twelve-message pages with the expected offset", async () => {
    await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ page: "3" }),
    });
    expect(messageFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 24, take: 12 }),
    );
  });

  test("malformed pages are clamped before calculating the offset", async () => {
    await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ page: "NaN" }),
    });
    expect(messageFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 12 }),
    );
  });

  test("passes every visible message id to MarkMessagesSeen", async () => {
    messageFindMany.mockImplementation(async () => [rootMessage("m1"), rootMessage("m2")]);
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    const marker = findOne(tree, (node) => node.type === MarkMessagesSeenMock);
    expect(marker.props.messageIds).toEqual(["m1", "m2"]);
  });

  test("renders AutoRefresh only for the owner branch", async () => {
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(findAll(tree, (node) => node.type === AutoRefreshMock)).toHaveLength(1);
  });

  test("passes owner capabilities into every message card", async () => {
    messageFindMany.mockImplementation(async () => [rootMessage("m1")]);
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    const card = findOne(tree, (node) => node.type === MessageCardMock);
    expect(card.props.isOwner).toBe(true);
    expect(card.props.recipientId).toBe("owner-1");
    expect(card.props.recipientUsername).toBe("alice");
  });

  test("uses a normalized profile URL for the owner share panel", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://blindsay.example///";
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    const panel = findOne(tree, (node) => node.type === SharePanelMock);
    expect(panel.props.url).toBe("https://blindsay.example/alice");
    expect(panel.props.orientation).toBe("vertical");
  });

  test("renders the correct empty message for the published filter", async () => {
    const tree = await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ filter: "published" }),
    });
    expect(textContent(tree)).toContain("No published replies yet.");
  });

  test("renders previous and next links inside the valid page range", async () => {
    let call = 0;
    messageCount.mockImplementation(async () => (++call === 1 ? 36 : 0));
    const tree = await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ page: "2" }),
    });
    const hrefs = findAll(tree, (node) => node.type === LinkMock).map(
      (node) => node.props.href,
    );
    expect(hrefs).toContain("/alice?filter=all&page=1");
    expect(hrefs).toContain("/alice?filter=all&page=3");
    expect(textContent(tree)).toContain("page 2 of 3");
  });
});
