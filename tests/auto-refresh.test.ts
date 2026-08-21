import { describe, expect, mock, test } from "bun:test";
import { runAutoRefreshCheck } from "../lib/auto-refresh";

describe("runAutoRefreshCheck", () => {
  test("does nothing while the document is hidden", async () => {
    const check = mock(async () => ({ hasNew: true }));
    const refresh = mock(() => {});

    expect(await runAutoRefreshCheck({
      hidden: true,
      lastCheck: 123,
      checkForNewMessages: check,
      refresh,
    })).toBe(123);
    expect(check).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  test("does nothing before the initial timestamp is established", async () => {
    const check = mock(async () => ({ hasNew: true }));
    const refresh = mock(() => {});

    expect(await runAutoRefreshCheck({
      hidden: false,
      lastCheck: null,
      checkForNewMessages: check,
      refresh,
    })).toBeNull();
    expect(check).not.toHaveBeenCalled();
  });

  test("queries from the previous check timestamp", async () => {
    const check = mock(async () => ({ hasNew: false }));
    const refresh = mock(() => {});

    expect(await runAutoRefreshCheck({
      hidden: false,
      lastCheck: 1_700_000_000_000,
      checkForNewMessages: check,
      refresh,
    })).toBe(1_700_000_000_000);
    expect(check).toHaveBeenCalledWith(new Date(1_700_000_000_000));
    expect(refresh).not.toHaveBeenCalled();
  });

  test("advances the timestamp only when new messages trigger a refresh", async () => {
    const check = mock(async () => ({ hasNew: true }));
    const refresh = mock(() => {});

    expect(await runAutoRefreshCheck({
      hidden: false,
      lastCheck: 100,
      checkForNewMessages: check,
      refresh,
      now: () => 200,
    })).toBe(200);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test("swallows polling failures and preserves the previous timestamp", async () => {
    const check = mock(async () => {
      throw new Error("network failure");
    });
    const refresh = mock(() => {});

    expect(await runAutoRefreshCheck({
      hidden: false,
      lastCheck: 321,
      checkForNewMessages: check,
      refresh,
      now: () => 999,
    })).toBe(321);
    expect(refresh).not.toHaveBeenCalled();
  });

  test("does not refresh when the poll reports no new messages", async () => {
    const refresh = mock(() => {});
    expect(await runAutoRefreshCheck({
      hidden: false,
      lastCheck: 555,
      checkForNewMessages: async () => ({ hasNew: false }),
      refresh,
      now: () => 777,
    })).toBe(555);
    expect(refresh).not.toHaveBeenCalled();
  });
});
