import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, textContent } from "./react-tree";

const redirect = mock((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const getServerSession = mock(async () => null as any);
const userFindUnique = mock(async (_args?: any) => null as any);
const aggregate = mock(async (_args?: any) => ({ _count: { id: 0 } }));
const findFirst = mock(async (_args?: any) => null as any);
let rawRows: Array<{ date: Date; messages: bigint; replies: bigint }> = [];
const queryRaw = mock(async (..._args: any[]) => rawRows);
const formatRelativeTime = mock((_date: Date, _now: Date) => "relative");

mock.module("next/navigation", () => ({ redirect }));
mock.module("next-auth", () => ({ getServerSession }));
mock.module("@/auth", () => ({ authOptions: {} }));
mock.module("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: userFindUnique },
    message: { aggregate, findFirst },
    $queryRaw: queryRaw,
  },
}));
mock.module("@/lib/relative-time", () => ({ formatRelativeTime }));

const AnalyticsPage = (await import("../app/(app)/analytics/page")).default;

beforeEach(() => {
  redirect.mockClear();
  getServerSession.mockClear();
  getServerSession.mockImplementation(async () => null);
  userFindUnique.mockClear();
  userFindUnique.mockImplementation(async () => ({ id: "owner-1", username: "alice" }));
  aggregate.mockClear();
  aggregate.mockImplementation(async () => ({ _count: { id: 0 } }));
  findFirst.mockClear();
  findFirst.mockImplementation(async () => null);
  queryRaw.mockClear();
  rawRows = [];
  formatRelativeTime.mockClear();
  formatRelativeTime.mockImplementation(() => "relative");
});

describe("analytics access", () => {
  test("redirects without an authenticated email before database access", async () => {
    await expect(AnalyticsPage()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  test("redirects sessions missing an email", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "owner-1" } }));
    await expect(AnalyticsPage()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  test("looks up the authenticated user by session id", async () => {
    getServerSession.mockImplementation(async () => ({
      user: { id: "owner-9", email: "owner@example.test" },
    }));
    await AnalyticsPage();
    expect(userFindUnique).toHaveBeenCalledWith({
      where: { id: "owner-9" },
      select: { id: true, username: true },
    });
  });

  test("redirects when the session points at a missing user", async () => {
    getServerSession.mockImplementation(async () => ({
      user: { id: "missing", email: "owner@example.test" },
    }));
    userFindUnique.mockImplementation(async () => null);
    await expect(AnalyticsPage()).rejects.toThrow("NEXT_REDIRECT:/");
  });
});

describe("analytics queries", () => {
  beforeEach(() => {
    getServerSession.mockImplementation(async () => ({
      user: { id: "owner-1", email: "owner@example.test" },
    }));
  });

  test("counts only live root messages", async () => {
    await AnalyticsPage();
    expect(aggregate.mock.calls[0][0]).toEqual({
      where: { recipientId: "owner-1", parentId: null, deletedAt: null },
      _count: { id: true },
    });
  });

  test("counts only live replies", async () => {
    await AnalyticsPage();
    expect(aggregate.mock.calls[1][0]).toEqual({
      where: {
        recipientId: "owner-1",
        parentId: { not: null },
        deletedAt: null,
      },
      _count: { id: true },
    });
  });

  test("queries latest live root message in descending order", async () => {
    await AnalyticsPage();
    expect(findFirst.mock.calls[0][0]).toEqual({
      where: { recipientId: "owner-1", parentId: null, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  });

  test("queries latest live reply in descending order", async () => {
    await AnalyticsPage();
    expect(findFirst.mock.calls[1][0]).toEqual({
      where: {
        recipientId: "owner-1",
        parentId: { not: null },
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  });

  test("binds the authenticated user id into the raw activity query", async () => {
    await AnalyticsPage();
    expect(queryRaw).toHaveBeenCalledTimes(1);
    const args = queryRaw.mock.calls[0];
    expect(args).toHaveLength(3);
    expect(args[1]).toBe("owner-1");
    expect(args[2]).toBeInstanceOf(Date);
    expect(args[0].join(" ")).toContain('"deletedAt" IS NULL');
    expect(args[0].join(" ")).toContain('GROUP BY DATE("createdAt")');
  });
});

describe("analytics rendering", () => {
  beforeEach(() => {
    getServerSession.mockImplementation(async () => ({
      user: { id: "owner-1", email: "owner@example.test" },
    }));
  });

  test("shows em dashes for latest activity and response ratio with no messages", async () => {
    const tree = await AnalyticsPage();
    const text = textContent(tree);
    expect(text).toContain("Latest message");
    expect(text).toContain("Latest reply");
    expect(text).toContain("Response ratio");
    expect((text.match(/—/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });

  test("renders message/reply totals and rounded response ratio", async () => {
    aggregate.mockImplementation(async (args: any) => ({
      _count: { id: args.where.parentId === null ? 3 : 2 },
    }));
    const tree = await AnalyticsPage();
    const text = textContent(tree);
    expect(text).toContain("67%");
    expect(text).toContain("Replies total");
  });

  test("formats both latest timestamps against the same render-time now", async () => {
    const messageDate = new Date("2026-08-01T00:00:00Z");
    const replyDate = new Date("2026-08-02T00:00:00Z");
    findFirst.mockImplementation(async (args: any) =>
      args.where.parentId === null
        ? { createdAt: messageDate }
        : { createdAt: replyDate },
    );
    await AnalyticsPage();
    expect(formatRelativeTime).toHaveBeenCalledTimes(2);
    expect(formatRelativeTime.mock.calls[0][0]).toBe(messageDate);
    expect(formatRelativeTime.mock.calls[1][0]).toBe(replyDate);
    expect(formatRelativeTime.mock.calls[0][1]).toBe(
      formatRelativeTime.mock.calls[1][1],
    );
  });

  test("converts bigint activity rows into numeric bar titles", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    rawRows = [{ date: today, messages: 2n, replies: 3n }];
    const tree = await AnalyticsPage();
    const titles = findAll(tree, (node) => typeof node.props?.title === "string").map(
      (node) => node.props.title,
    );
    expect(titles).toContain("2 messages");
    expect(titles).toContain("3 replies");
  });

  test("accumulates duplicate raw rows for the same day", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    rawRows = [
      { date: today, messages: 2n, replies: 1n },
      { date: today, messages: 5n, replies: 4n },
    ];
    const tree = await AnalyticsPage();
    const titles = findAll(tree, (node) => typeof node.props?.title === "string").map(
      (node) => node.props.title,
    );
    expect(titles).toContain("7 messages");
    expect(titles).toContain("5 replies");
  });

  test("keeps zero-value bars at the eight-pixel visual floor", async () => {
    const tree = await AnalyticsPage();
    const zeroMessageBar = findAll(
      tree,
      (node) => node.props?.title === "0 messages",
    )[0];
    expect(zeroMessageBar.props.style).toEqual({ height: "8px" });
  });
});
