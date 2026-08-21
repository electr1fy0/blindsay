import { beforeEach, describe, expect, mock, test } from "bun:test";

let refIndex = 0;
const lastCheckRef = { current: null as number | null };
const checkingRef = { current: false };
const useRef = mock((_initial: any) => {
  const index = refIndex++;
  return index === 0 ? lastCheckRef : checkingRef;
});
const effects: Array<() => void | (() => void)> = [];
const useEffect = mock((effect: () => void | (() => void)) => {
  effects.push(effect);
});
const refresh = mock(() => {});
const useRouter = mock(() => ({ refresh }));
const checkForNewMessages = mock(async (_since: Date) => ({ hasNew: false }));
const runAutoRefreshCheck = mock(async (_options: any) => lastCheckRef.current);

mock.module("react", () => ({ useEffect, useRef }));
mock.module("next/navigation", () => ({ useRouter }));
mock.module("@/app/actions", () => ({ checkForNewMessages }));
mock.module("@/lib/auto-refresh", () => ({ runAutoRefreshCheck }));

const { AutoRefresh } = await import("../components/auto-refresh");

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalDateNow = Date.now;
const setIntervalMock = mock((_callback: () => void, _ms: number) => 77 as any);
const clearIntervalMock = mock((_id: any) => {});
let hidden = false;

function render(intervalMs?: number) {
  refIndex = 0;
  effects.length = 0;
  return AutoRefresh(intervalMs === undefined ? {} : { intervalMs });
}

function installEffects() {
  const cleanups = effects.map((effect) => effect());
  return cleanups;
}

beforeEach(() => {
  lastCheckRef.current = null;
  checkingRef.current = false;
  hidden = false;
  refIndex = 0;
  effects.length = 0;
  useRef.mockClear();
  useEffect.mockClear();
  useRouter.mockClear();
  refresh.mockClear();
  checkForNewMessages.mockClear();
  runAutoRefreshCheck.mockClear();
  runAutoRefreshCheck.mockImplementation(async () => lastCheckRef.current);
  setIntervalMock.mockClear();
  clearIntervalMock.mockClear();
  globalThis.window = {
    setInterval: setIntervalMock,
    clearInterval: clearIntervalMock,
  } as any;
  globalThis.document = {
    get hidden() {
      return hidden;
    },
  } as any;
  Date.now = () => 1_700_000_000_000;
});

describe("AutoRefresh initialization", () => {
  test("renders no visible element", () => {
    expect(render()).toBeNull();
  });

  test("creates separate last-check and overlap refs", () => {
    render();
    expect(useRef).toHaveBeenCalledTimes(2);
    expect(useRef.mock.calls[0][0]).toBeNull();
    expect(useRef.mock.calls[1][0]).toBe(false);
  });

  test("first effect establishes the initial timestamp", () => {
    render();
    expect(effects).toHaveLength(2);
    effects[0]();
    expect(lastCheckRef.current).toBe(1_700_000_000_000);
  });
});

describe("AutoRefresh interval lifecycle", () => {
  test("uses a sixty-second interval by default", () => {
    render();
    installEffects();
    expect(setIntervalMock).toHaveBeenCalledWith(expect.any(Function), 60_000);
  });

  test("honors a custom interval", () => {
    render(2_500);
    installEffects();
    expect(setIntervalMock).toHaveBeenCalledWith(expect.any(Function), 2_500);
  });

  test("cleanup clears the exact interval handle", () => {
    render();
    const cleanups = installEffects();
    expect(cleanups[1]).toBeFunction();
    cleanups[1]!();
    expect(clearIntervalMock).toHaveBeenCalledWith(77);
  });
});

describe("AutoRefresh polling", () => {
  async function intervalTick() {
    render();
    installEffects();
    const callback = setIntervalMock.mock.calls[0][0] as () => Promise<void>;
    await callback();
  }

  test("passes visibility, timestamp, server checker, and router refresh to helper", async () => {
    hidden = true;
    lastCheckRef.current = 1234;
    await intervalTick();
    expect(runAutoRefreshCheck).toHaveBeenCalledWith({
      hidden: true,
      lastCheck: 1_700_000_000_000,
      checkForNewMessages,
      refresh,
    });
  });

  test("stores the helper-returned timestamp", async () => {
    runAutoRefreshCheck.mockImplementation(async () => 1_700_000_123_456);
    await intervalTick();
    expect(lastCheckRef.current).toBe(1_700_000_123_456);
  });

  test("restores overlap guard when helper rejects unexpectedly", async () => {
    runAutoRefreshCheck.mockImplementation(async () => {
      throw new Error("unexpected helper failure");
    });
    render();
    installEffects();
    const callback = setIntervalMock.mock.calls[0][0] as () => Promise<void>;
    await expect(callback()).rejects.toThrow("unexpected helper failure");
    expect(checkingRef.current).toBe(false);
  });

  test("does not start a second poll while one is already running", async () => {
    let resolve!: (value: number | null) => void;
    const pending = new Promise<number | null>((r) => {
      resolve = r;
    });
    runAutoRefreshCheck.mockImplementation(async () => pending);

    render();
    installEffects();
    const callback = setIntervalMock.mock.calls[0][0] as () => Promise<void>;
    const first = callback();
    expect(checkingRef.current).toBe(true);
    await callback();
    expect(runAutoRefreshCheck).toHaveBeenCalledTimes(1);
    resolve(1_700_000_000_111);
    await first;
    expect(checkingRef.current).toBe(false);
    expect(lastCheckRef.current).toBe(1_700_000_000_111);
  });
});

process.on("exit", () => {
  globalThis.window = originalWindow;
  globalThis.document = originalDocument;
  Date.now = originalDateNow;
});
