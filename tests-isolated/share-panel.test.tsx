import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findOne, textContent } from "./react-tree";

let copiedState = false;
const setCopied = mock((_value: boolean) => {});
const timerRef = { current: null as any };
let cleanup: (() => void) | undefined;
let accentTheme: "sky" | "sage" | "rose" = "sky";

const useState = mock((_initial: any) => [copiedState, setCopied]);
const useRef = mock((_initial: any) => timerRef);
const useEffect = mock((effect: () => void | (() => void)) => {
  cleanup = effect() || undefined;
});
const useAccentTheme = mock(() => ({ accentTheme }));
const copyTextToClipboard = mock(async (_text: string) => true);
const toastError = mock((_message: string) => {});

const ButtonMock = (_props: any) => null;
const QRMock = (_props: any) => null;
const HugeiconsIconMock = (_props: any) => null;

mock.module("react", () => ({ useState, useRef, useEffect }));
mock.module("@/components/accent-theme-provider", () => ({ useAccentTheme }));
mock.module("@/lib/clipboard", () => ({ copyTextToClipboard }));
mock.module("sonner", () => ({ toast: { error: toastError } }));
mock.module("@/components/ui/button", () => ({ Button: ButtonMock }));
mock.module("@lglab/react-qr-code", () => ({ ReactQRCode: QRMock }));
mock.module("@hugeicons/react", () => ({ HugeiconsIcon: HugeiconsIconMock }));
mock.module("@hugeicons/core-free-icons", () => ({ Link01Icon: {}, QrCode01Icon: {} }));

const { SharePanel } = await import("../components/share-panel");

const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
let nextTimerId = 1;
const timerCallbacks = new Map<number, () => void>();
const setTimeoutMock = mock((callback: () => void, delay?: number) => {
  const id = nextTimerId++;
  timerCallbacks.set(id, callback);
  return id as any;
});
const clearTimeoutMock = mock((id: any) => {
  timerCallbacks.delete(Number(id));
});

beforeEach(() => {
  copiedState = false;
  accentTheme = "sky";
  timerRef.current = null;
  cleanup = undefined;
  setCopied.mockClear();
  useState.mockClear();
  useRef.mockClear();
  useEffect.mockClear();
  useAccentTheme.mockClear();
  copyTextToClipboard.mockClear();
  copyTextToClipboard.mockImplementation(async () => true);
  toastError.mockClear();
  setTimeoutMock.mockClear();
  clearTimeoutMock.mockClear();
  timerCallbacks.clear();
  nextTimerId = 1;
  globalThis.setTimeout = setTimeoutMock as any;
  globalThis.clearTimeout = clearTimeoutMock as any;
});

describe("SharePanel QR rendering", () => {
  test.each([
    ["sky", "#00b9ff"],
    ["sage", "#4e9f73"],
    ["rose", "#e56b6f"],
  ] as const)("uses %s accent color", (theme, expectedColor) => {
    accentTheme = theme;
    const tree = SharePanel({ url: "https://example.test/alice" });
    const qr = findOne(tree, (node) => node.type === QRMock);
    expect(qr.props.value).toBe("https://example.test/alice");
    expect(qr.props.dataModulesSettings.color).toBe(expectedColor);
    expect(qr.props.finderPatternOuterSettings.color).toBe(expectedColor);
    expect(qr.props.finderPatternInnerSettings.color).toBe(expectedColor);
  });

  test("renders the raw URL text without mutating it", () => {
    const url = "https://example.test/ALICE_1?x=1";
    const tree = SharePanel({ url });
    expect(textContent(tree)).toContain(url);
  });

  test("uses the copy label before a successful copy", () => {
    const tree = SharePanel({ url: "https://example.test/alice" });
    expect(textContent(findOne(tree, (node) => node.type === ButtonMock))).toContain("Copy link");
  });

  test("uses the copied label while copied state is active", () => {
    copiedState = true;
    const tree = SharePanel({ url: "https://example.test/alice" });
    expect(textContent(findOne(tree, (node) => node.type === ButtonMock))).toContain("Copied");
  });
});

describe("SharePanel clipboard behavior", () => {
  test("copies the exact URL before showing success state", async () => {
    const tree = SharePanel({ url: "https://example.test/alice" });
    const button = findOne(tree, (node) => node.type === ButtonMock);
    await button.props.onClick();
    expect(copyTextToClipboard).toHaveBeenCalledWith("https://example.test/alice");
    expect(setCopied).toHaveBeenCalledWith(true);
    expect(setTimeoutMock).toHaveBeenCalledWith(expect.any(Function), 1200);
  });

  test("reports clipboard failure without lying that the URL was copied", async () => {
    copyTextToClipboard.mockImplementation(async () => false);
    const tree = SharePanel({ url: "https://example.test/alice" });
    await findOne(tree, (node) => node.type === ButtonMock).props.onClick();
    expect(toastError).toHaveBeenCalledWith("Unable to copy link.");
    expect(setCopied).not.toHaveBeenCalledWith(true);
    expect(setTimeoutMock).not.toHaveBeenCalled();
  });

  test("the reset timer clears copied state after 1200ms", async () => {
    const tree = SharePanel({ url: "https://example.test/alice" });
    await findOne(tree, (node) => node.type === ButtonMock).props.onClick();
    const timerId = Number(timerRef.current);
    expect(timerCallbacks.has(timerId)).toBe(true);
    timerCallbacks.get(timerId)!();
    expect(timerRef.current).toBeNull();
    expect(setCopied).toHaveBeenCalledWith(false);
  });

  test("repeated copies cancel the previous reset timer", async () => {
    const tree = SharePanel({ url: "https://example.test/alice" });
    const onClick = findOne(tree, (node) => node.type === ButtonMock).props.onClick;
    await onClick();
    const firstTimer = timerRef.current;
    await onClick();
    expect(clearTimeoutMock).toHaveBeenCalledWith(firstTimer);
    expect(timerRef.current).not.toBe(firstTimer);
  });

  test("unmount cleanup cancels an outstanding reset timer", async () => {
    const tree = SharePanel({ url: "https://example.test/alice" });
    await findOne(tree, (node) => node.type === ButtonMock).props.onClick();
    const activeTimer = timerRef.current;
    expect(cleanup).toBeFunction();
    cleanup!();
    expect(clearTimeoutMock).toHaveBeenCalledWith(activeTimer);
  });

  test("unmount cleanup is a no-op when no copy timer exists", () => {
    SharePanel({ url: "https://example.test/alice" });
    expect(cleanup).toBeFunction();
    cleanup!();
    expect(clearTimeoutMock).not.toHaveBeenCalled();
  });
});

process.on("exit", () => {
  globalThis.setTimeout = originalSetTimeout;
  globalThis.clearTimeout = originalClearTimeout;
});
