import { beforeEach, describe, expect, mock, test } from "bun:test";

const getServerSession = mock(async () => null as any);
const notFound = mock(() => {
  throw new Error("NEXT_NOT_FOUND");
});

const prisma = {
  user: {
    findUnique: mock(async (_args?: any) => null as any),
  },
  message: {
    count: mock(async (_args?: any) => 0),
    findMany: mock(async (_args?: any) => [] as any[]),
  },
};

const Link = (props: any) => props.children;
const CreateMessageForm = (_props: any) => null;
const MessageCard = (_props: any) => null;
const MarkMessagesSeen = (_props: any) => null;
const AutoRefresh = (_props: any) => null;
const SharePanel = (_props: any) => null;
const ThemeToggle = (_props: any) => null;
const formatRelativeTime = mock((_date: Date, _now: Date) => "in 2 hours");

mock.module("next/link", () => ({ default: Link }));
mock.module("next/navigation", () => ({ notFound }));
mock.module("next-auth", () => ({ getServerSession }));
mock.module("@/auth", () => ({ authOptions: {} }));
mock.module("@/lib/prisma", () => ({ prisma }));
mock.module("@/components/create-message-form", () => ({ CreateMessageForm }));
mock.module("@/components/message-card", () => ({ MessageCard }));
mock.module("@/components/new-badge", () => ({ MarkMessagesSeen }));
mock.module("@/components/auto-refresh", () => ({ AutoRefresh }));
mock.module("@/components/share-panel", () => ({ SharePanel }));
mock.module("@/components/theme-toggle", () => ({ ThemeToggle }));
mock.module("@/lib/relative-time", () => ({ formatRelativeTime }));

const pageModule = await import("../app/(app)/[username]/page");
const UserInboxPage = pageModule.default;

const defaultProfile = {
  id: "user-1",
  username: "alice",
  name: "Alice",
  inboxOpen: true,
  inboxPausedUntil: null,
};

function walk(node: any, visit: (value: any) => void) {
  if (node == null || typeof node === "boolean") return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  visit(node);
  if (typeof node === "object" && node.props) walk(node.props.children, visit);
}

function findByType(root: any, type: any) {
  const matches: any[] = [];
  walk(root, (node) => {
    if (typeof node === "object" && node?.type === type) matches.push(node);
  });
  return matches;
}

function textContent(root: any) {
  const values: string[] = [];
  walk(root, (node) => {
    if (typeof node === "string" || typeof node === "number") values.push(String(node));
  });
  return values.join(" ");
}

beforeEach(() => {
  getServerSession.mockClear();
  getServerSession.mockImplementation(async () => null);
  notFound.mockClear();
  prisma.user.findUnique.mockClear();
  prisma.user.findUnique.mockImplementation(async () => defaultProfile);
  prisma.message.count.mockClear();
  prisma.message.count.mockImplementation(async () => 0);
  prisma.message.findMany.mockClear();
  prisma.message.findMany.mockImplementation(async () => []);
  formatRelativeTime.mockClear();
  formatRelativeTime.mockImplementation(() => "in 2 hours");
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_URL;
});

describe("generateMetadata", () => {
  test("returns empty metadata when username is missing", async () => {
    expect(await pageModule.generateMetadata({ params: Promise.resolve({}) })).toEqual({});
  });

  test("normalizes usernames and uses localhost by default", async () => {
    const metadata = await pageModule.generateMetadata({
      params: Promise.resolve({ username: "Alice" }),
    });

    expect(metadata.title).toBe("Leave a note for @alice");
    expect(metadata.alternates).toEqual({ canonical: "http://localhost:3000/alice" });
    expect(metadata.openGraph?.url).toBe("http://localhost:3000/alice");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "http://localhost:3000/api/og/alice",
        width: 1200,
        height: 630,
        alt: "@alice on Blindsay",
      },
    ]);
  });

  test("prefers NEXT_PUBLIC_SITE_URL", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://blindsay.example";
    process.env.VERCEL_URL = "ignored.vercel.app";

    const metadata = await pageModule.generateMetadata({
      params: Promise.resolve({ username: "alice" }),
    });
    expect(metadata.alternates).toEqual({ canonical: "https://blindsay.example/alice" });
  });

  test("falls back to VERCEL_URL when public site URL is absent", async () => {
    process.env.VERCEL_URL = "preview.vercel.app";
    const metadata = await pageModule.generateMetadata({
      params: Promise.resolve({ username: "alice" }),
    });
    expect(metadata.openGraph?.url).toBe("https://preview.vercel.app/alice");
  });

  test("keeps Twitter and Open Graph image URLs aligned", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://blindsay.example";
    const metadata = await pageModule.generateMetadata({
      params: Promise.resolve({ username: "alice" }),
    });
    expect(metadata.twitter?.images).toEqual(["https://blindsay.example/api/og/alice"]);
  });
});

describe("UserInboxPage routing and queries", () => {
  test("not-founds when the route has no username", async () => {
    await expect(UserInboxPage({ params: Promise.resolve({}) })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  test("normalizes username before profile lookup", async () => {
    await UserInboxPage({ params: Promise.resolve({ username: "ALICE" }) });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { username: "alice" },
      select: {
        id: true,
        username: true,
        name: true,
        inboxOpen: true,
        inboxPausedUntil: true,
      },
    });
  });

  test("not-founds when the profile does not exist", async () => {
    prisma.user.findUnique.mockImplementation(async () => null);
    await expect(UserInboxPage({ params: Promise.resolve({ username: "missing" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  test("visitors only fetch messages with replies", async () => {
    await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(prisma.message.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        recipientId: "user-1",
        parentId: null,
        deletedAt: null,
        replies: { some: {} },
      },
      skip: 0,
      take: 12,
    }));
  });

  test("visitors do not run the owner-only published-count query", async () => {
    await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(prisma.message.count).toHaveBeenCalledTimes(1);
  });

  test("owners fetch all messages by default", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "user-1" } }));
    await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });

    expect(prisma.message.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        recipientId: "user-1",
        parentId: null,
        deletedAt: null,
      },
    }));
    expect(prisma.message.count).toHaveBeenCalledTimes(2);
  });

  test("owner published filter restricts both list and total count", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "user-1" } }));
    await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ filter: "published" }),
    });

    expect(prisma.message.count.mock.calls[0][0].where).toEqual({
      recipientId: "user-1",
      parentId: null,
      deletedAt: null,
      replies: { some: {} },
    });
    expect(prisma.message.findMany.mock.calls[0][0].where).toEqual({
      recipientId: "user-1",
      parentId: null,
      deletedAt: null,
      replies: { some: {} },
    });
  });

  test("unknown filter values fall back to all", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "user-1" } }));
    await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ filter: "garbage" }),
    });
    expect(prisma.message.findMany.mock.calls[0][0].where).toEqual({
      recipientId: "user-1",
      parentId: null,
      deletedAt: null,
    });
  });

  test("clamps negative page numbers to the first page", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "user-1" } }));
    await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ page: "-5" }),
    });
    expect(prisma.message.findMany.mock.calls[0][0].skip).toBe(0);
  });

  test("uses 12-message owner pages", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "user-1" } }));
    await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ page: "3" }),
    });
    expect(prisma.message.findMany.mock.calls[0][0].skip).toBe(24);
    expect(prisma.message.findMany.mock.calls[0][0].take).toBe(12);
  });
});

describe("visitor rendering", () => {
  test("shows the message form for an open, unpaused inbox", async () => {
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    const forms = findByType(tree, CreateMessageForm);
    expect(forms).toHaveLength(1);
    expect(forms[0].props).toEqual({
      recipientId: "user-1",
      recipientUsername: "alice",
    });
  });

  test("shows a closed-inbox message instead of the form", async () => {
    prisma.user.findUnique.mockImplementation(async () => ({ ...defaultProfile, inboxOpen: false }));
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(findByType(tree, CreateMessageForm)).toHaveLength(0);
    expect(textContent(tree)).toContain("This inbox is currently closed.");
  });

  test("shows a relative pause message instead of the form", async () => {
    const pausedUntil = new Date(Date.now() + 60 * 60 * 1000);
    prisma.user.findUnique.mockImplementation(async () => ({
      ...defaultProfile,
      inboxPausedUntil: pausedUntil,
    }));
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(findByType(tree, CreateMessageForm)).toHaveLength(0);
    expect(textContent(tree)).toContain("This inbox is paused in 2 hours.");
    expect(formatRelativeTime).toHaveBeenCalledTimes(1);
  });

  test("renders only messages that actually have a reply", async () => {
    prisma.message.findMany.mockImplementation(async () => [
      { id: "published", replies: [{ id: "reply-1" }] },
      { id: "defensive-unpublished", replies: [] },
    ] as any);
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    const cards = findByType(tree, MessageCard);
    expect(cards).toHaveLength(1);
    expect(cards[0].props.message.id).toBe("published");
    expect(cards[0].props.reply.id).toBe("reply-1");
    expect(cards[0].props.isOwner).toBe(false);
  });

  test("shows the public empty state when there are no published replies", async () => {
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(textContent(tree)).toContain("No replies yet. Be the first to leave a note.");
  });
});

describe("owner rendering", () => {
  test("mounts refresh and seen-state helpers", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "user-1" } }));
    prisma.message.findMany.mockImplementation(async () => [
      { id: "m1", replies: [] },
      { id: "m2", replies: [] },
    ] as any);

    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(findByType(tree, AutoRefresh)).toHaveLength(1);
    const seen = findByType(tree, MarkMessagesSeen);
    expect(seen).toHaveLength(1);
    expect(seen[0].props.messageIds).toEqual(["m1", "m2"]);
  });

  test("renders owner message cards with ownership props", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "user-1" } }));
    prisma.message.findMany.mockImplementation(async () => [
      { id: "m1", replies: [{ id: "r1" }] },
      { id: "m2", replies: [] },
    ] as any);

    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    const cards = findByType(tree, MessageCard);
    expect(cards).toHaveLength(2);
    expect(cards[0].props).toEqual(expect.objectContaining({
      recipientId: "user-1",
      recipientUsername: "alice",
      isOwner: true,
      reply: { id: "r1" },
    }));
    expect(cards[1].props.reply).toBeNull();
  });

  test("renders published count returned by the second count query", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "user-1" } }));
    let call = 0;
    prisma.message.count.mockImplementation(async () => (++call === 1 ? 25 : 7));

    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    expect(textContent(tree)).toContain("Published 7");
    expect(textContent(tree)).toContain("page 1 of 3");
  });

  test("shows filter-specific empty copy", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "user-1" } }));
    const tree = await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ filter: "published" }),
    });
    expect(textContent(tree)).toContain("No published replies yet.");
  });

  test("builds a share URL from the configured site URL", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://blindsay.example";
    getServerSession.mockImplementation(async () => ({ user: { id: "user-1" } }));
    const tree = await UserInboxPage({ params: Promise.resolve({ username: "alice" }) });
    const panels = findByType(tree, SharePanel);
    expect(panels).toHaveLength(1);
    expect(panels[0].props.url).toBe("https://blindsay.example/alice");
    expect(panels[0].props.orientation).toBe("vertical");
  });

  test("renders Previous and Next links only when valid", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "user-1" } }));
    prisma.message.count.mockImplementation(async () => 36);
    const tree = await UserInboxPage({
      params: Promise.resolve({ username: "alice" }),
      searchParams: Promise.resolve({ page: "2" }),
    });
    const links = findByType(tree, Link).map((node) => node.props.href);
    expect(links).toContain("/alice?filter=all&page=1");
    expect(links).toContain("/alice?filter=all&page=3");
  });
});
