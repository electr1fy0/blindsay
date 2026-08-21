import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, findOne, textContent } from "./react-tree";

let activeTabState: any = "appearance";
let userState: any = null;
let loadingState = true;
let starsState: string | null = null;
let shareUrlState = "";
let stateIndex = 0;
const setActiveTab = mock((_value: any) => {});
const setUser = mock((_value: any) => {});
const setLoading = mock((_value: boolean) => {});
const setStars = mock((_value: string | null) => {});
const setShareUrl = mock((_value: string) => {});
const useState = mock((initial: any) => {
  const index = stateIndex++;
  if (index === 0) return [activeTabState ?? initial, setActiveTab];
  if (index === 1) return [userState, setUser];
  if (index === 2) return [loadingState, setLoading];
  if (index === 3) return [starsState, setStars];
  return [shareUrlState, setShareUrl];
});
const effects: Array<() => void | (() => void)> = [];
const useEffect = mock((effect: () => void | (() => void)) => {
  effects.push(effect);
});
const needsRefreshRef = { current: false };
const useRef = mock((_initial: any) => needsRefreshRef);

const refresh = mock(() => {});
const push = mock((_path: string) => {});
const useRouter = mock(() => ({ refresh, push }));
let themeState = "system";
let resolvedThemeState = "light";
const setTheme = mock((_theme: string) => {});
const useTheme = mock(() => ({
  theme: themeState,
  resolvedTheme: resolvedThemeState,
  setTheme,
}));
let accentState: any = "sky";
const setAccentTheme = mock((_theme: any) => {});
const useAccentTheme = mock(() => ({
  accentTheme: accentState,
  setAccentTheme,
}));
const getUserSettings = mock(async () => null as any);
const toggleInboxOpen = mock(async () => ({ success: true } as any));
const formatRelativeTime = mock((_date: Date, _now: Date) => "in 2 hours");
const toastSuccess = mock((_message: string) => {});
const toastError = mock((_message: string) => {});

const ButtonMock = (_props: any) => null;
const UsernameFormMock = (_props: any) => null;
const PauseInboxFormMock = (_props: any) => null;
const HiddenWordsFormMock = (_props: any) => null;
const SignOutButtonMock = (_props: any) => null;
const SharePanelMock = (_props: any) => null;
const HugeiconsIconMock = (_props: any) => null;
const LinkMock = (_props: any) => null;
const ImageMock = (_props: any) => null;

mock.module("react", () => ({ useState, useEffect, useRef }));
mock.module("next/navigation", () => ({ useRouter }));
mock.module("next-themes", () => ({ useTheme }));
mock.module("@/app/actions", () => ({ toggleInboxOpen, getUserSettings }));
mock.module("@/lib/relative-time", () => ({ formatRelativeTime }));
mock.module("sonner", () => ({
  toast: { success: toastSuccess, error: toastError },
}));
mock.module("@/components/ui/button", () => ({ Button: ButtonMock }));
mock.module("@/components/username-form", () => ({ UsernameForm: UsernameFormMock }));
mock.module("@/components/pause-inbox-form", () => ({ PauseInboxForm: PauseInboxFormMock }));
mock.module("@/components/hidden-words-form", () => ({ HiddenWordsForm: HiddenWordsFormMock }));
mock.module("@/components/sign-out-button", () => ({ SignOutButton: SignOutButtonMock }));
mock.module("@/components/share-panel", () => ({ SharePanel: SharePanelMock }));
mock.module("@hugeicons/react", () => ({ HugeiconsIcon: HugeiconsIconMock }));
mock.module("@hugeicons/core-free-icons", () => ({
  UserSettings01Icon: {}, Notification03Icon: {}, HelpCircleIcon: {}, PaintBoardIcon: {},
  ToggleOnIcon: {}, ToggleOffIcon: {}, GithubIcon: {}, Cancel01Icon: {}, Message01Icon: {},
  Link01Icon: {}, Shield01Icon: {}, UserIcon: {}, Sun03Icon: {}, Moon02Icon: {}, LaptopIcon: {},
}));
mock.module("next/link", () => ({ default: LinkMock }));
mock.module("next/image", () => ({ default: ImageMock }));
mock.module("@/components/accent-theme-provider", () => ({
  accentThemes: [
    { id: "sky", name: "Sky", description: "Sky desc", preview: { accent: "#00b9ff", reply: "#dff2ff", replyDark: "#1075ab" } },
    { id: "sage", name: "Sage", description: "Sage desc", preview: { accent: "#4e9f73", reply: "#dbeee2", replyDark: "#1d5c3d" } },
    { id: "rose", name: "Rose", description: "Rose desc", preview: { accent: "#e56b6f", reply: "#f8dfe1", replyDark: "#802e3a" } },
  ],
  useAccentTheme,
}));
mock.module("@/lib/utils", () => ({
  cn: (...values: any[]) => values.filter(Boolean).join(" "),
}));

const { SettingsDialog } = await import("../components/settings-dialog");

const originalWindow = globalThis.window;
const originalFetch = globalThis.fetch;
const fetchMock = mock(async () => ({ ok: false, json: async () => null }) as any);
const defaultUser = {
  id: "owner-1",
  username: "alice",
  name: "Alice",
  email: "alice@example.test",
  image: null,
  inboxOpen: true,
  inboxPausedUntil: null,
  hiddenWords: ["secret"],
};

function render(props: any = {}) {
  stateIndex = 0;
  effects.length = 0;
  return SettingsDialog({
    isOpen: true,
    onClose: mock(() => {}),
    initialTab: "appearance",
    ...props,
  });
}

async function flushAsyncEffect(index: number) {
  effects[index]();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

beforeEach(() => {
  activeTabState = "appearance";
  userState = null;
  loadingState = true;
  starsState = null;
  shareUrlState = "";
  stateIndex = 0;
  effects.length = 0;
  needsRefreshRef.current = false;
  themeState = "system";
  resolvedThemeState = "light";
  accentState = "sky";
  setActiveTab.mockClear();
  setUser.mockClear();
  setLoading.mockClear();
  setStars.mockClear();
  setShareUrl.mockClear();
  useState.mockClear();
  useEffect.mockClear();
  useRef.mockClear();
  refresh.mockClear();
  push.mockClear();
  setTheme.mockClear();
  setAccentTheme.mockClear();
  getUserSettings.mockClear();
  getUserSettings.mockImplementation(async () => null);
  toggleInboxOpen.mockClear();
  toggleInboxOpen.mockImplementation(async () => ({ success: true }));
  formatRelativeTime.mockClear();
  toastSuccess.mockClear();
  toastError.mockClear();
  fetchMock.mockClear();
  fetchMock.mockImplementation(async () => ({ ok: false, json: async () => null }) as any);
  globalThis.fetch = fetchMock as any;
  globalThis.window = {
    location: { protocol: "https:", host: "blindsay.example" },
  } as any;
});

describe("SettingsDialog visibility and tabs", () => {
  test("returns null while closed", () => {
    expect(render({ isOpen: false })).toBeNull();
  });

  test("defaults to appearance tab", () => {
    userState = defaultUser;
    loadingState = false;
    const tree = render();
    expect(textContent(tree)).toContain("Appearance");
  });

  test("sync effect applies a changed initial tab", () => {
    render({ initialTab: "support" });
    effects[0]();
    expect(setActiveTab).toHaveBeenCalledWith("support");
  });

  test("desktop and mobile tab controls both change active tab", () => {
    userState = defaultUser;
    loadingState = false;
    const tree = render();
    const accountButtons = findAll(
      tree,
      (node) => node.type === "button" && textContent(node) === "Account",
    );
    expect(accountButtons.length).toBeGreaterThanOrEqual(2);
    for (const button of accountButtons) button.props.onClick();
    expect(setActiveTab.mock.calls.every(([value]) => value === "account")).toBe(true);
  });
});

describe("settings data loading", () => {
  test("closed dialog does not load settings", async () => {
    render({ isOpen: false });
    await flushAsyncEffect(1);
    expect(getUserSettings).not.toHaveBeenCalled();
  });

  test("open dialog loads settings when user cache is empty", async () => {
    getUserSettings.mockImplementation(async () => defaultUser);
    render();
    await flushAsyncEffect(1);
    expect(setLoading).toHaveBeenCalledWith(true);
    expect(getUserSettings).toHaveBeenCalledTimes(1);
    expect(setUser).toHaveBeenCalledWith(defaultUser);
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  test("null settings result still clears loading state", async () => {
    getUserSettings.mockImplementation(async () => null);
    render();
    await flushAsyncEffect(1);
    expect(setUser).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  test("settings load failure is contained and surfaced", async () => {
    getUserSettings.mockImplementation(async () => {
      throw new Error("session expired");
    });
    render();
    await flushAsyncEffect(1);
    expect(toastError).toHaveBeenCalledWith("Failed to load settings.");
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  test("already-loaded user skips the server read and clears loading", async () => {
    userState = defaultUser;
    render();
    await flushAsyncEffect(1);
    expect(getUserSettings).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenCalledWith(false);
  });
});

describe("settings rendering states", () => {
  test("shows loading state while data is pending", () => {
    loadingState = true;
    userState = null;
    expect(textContent(render())).toContain("Loading settings...");
  });

  test("shows stable login-again error after loading without a user", () => {
    loadingState = false;
    userState = null;
    expect(textContent(render())).toContain("Failed to load settings. Please log in again.");
  });

  test("account tab passes identity into username form and renders sign out", () => {
    activeTabState = "account";
    userState = defaultUser;
    loadingState = false;
    const tree = render({ initialTab: "account" });
    const username = findOne(tree, (node) => node.type === UsernameFormMock);
    expect(username.props.initialValue).toBe("alice");
    expect(username.props.submitLabel).toBe("Update username");
    expect(findAll(tree, (node) => node.type === SignOutButtonMock)).toHaveLength(1);
  });

  test("account tab falls back to claim copy when username is absent", () => {
    activeTabState = "account";
    userState = { ...defaultUser, username: null };
    loadingState = false;
    const tree = render({ initialTab: "account" });
    const username = findOne(tree, (node) => node.type === UsernameFormMock);
    expect(username.props.initialValue).toBe("");
    expect(username.props.submitLabel).toBe("Claim username");
  });

  test("profile image renders when settings include one", () => {
    activeTabState = "account";
    loadingState = false;
    userState = { ...defaultUser, image: "https://images.example/alice.png" };
    const tree = render({ initialTab: "account" });
    const image = findOne(tree, (node) => node.type === ImageMock);
    expect(image.props.src).toBe("https://images.example/alice.png");
    expect(image.props.alt).toBe("Alice");
  });
});

describe("share URL lifecycle", () => {
  test("builds share URL from current browser origin and username", () => {
    userState = defaultUser;
    render();
    effects[3]();
    expect(setShareUrl).toHaveBeenCalledWith("https://blindsay.example/alice");
  });

  test("does not build a share URL without username", () => {
    userState = { ...defaultUser, username: null };
    render();
    effects[3]();
    expect(setShareUrl).not.toHaveBeenCalled();
  });

  test("share tab passes generated URL into vertical SharePanel", () => {
    activeTabState = "share";
    userState = defaultUser;
    loadingState = false;
    shareUrlState = "https://blindsay.example/alice";
    const tree = render({ initialTab: "share" });
    const panel = findOne(tree, (node) => node.type === SharePanelMock);
    expect(panel.props.url).toBe("https://blindsay.example/alice");
    expect(panel.props.orientation).toBe("vertical");
  });

  test("share tab explains that username is required before showing SharePanel", () => {
    activeTabState = "share";
    userState = { ...defaultUser, username: null };
    loadingState = false;
    const tree = render({ initialTab: "share" });
    expect(findAll(tree, (node) => node.type === SharePanelMock)).toHaveLength(0);
    expect(textContent(tree)).toContain("Please set a username in the Account tab first");
  });
});

describe("inbox controls", () => {
  test("active inbox renders close action and child moderation controls", () => {
    activeTabState = "inbox";
    userState = defaultUser;
    loadingState = false;
    const tree = render({ initialTab: "inbox" });
    expect(textContent(tree)).toContain("Active");
    expect(textContent(tree)).toContain("Close Inbox");
    expect(findOne(tree, (node) => node.type === PauseInboxFormMock).props.isPaused).toBe(false);
    expect(findOne(tree, (node) => node.type === HiddenWordsFormMock).props.initialValue).toEqual(["secret"]);
  });

  test("closed inbox renders open action", () => {
    activeTabState = "inbox";
    userState = { ...defaultUser, inboxOpen: false };
    loadingState = false;
    const tree = render({ initialTab: "inbox" });
    expect(textContent(tree)).toContain("Closed");
    expect(textContent(tree)).toContain("Open Inbox");
  });

  test("future pause renders paused state and passes paused flag", () => {
    activeTabState = "inbox";
    userState = {
      ...defaultUser,
      inboxPausedUntil: new Date(Date.now() + 60_000),
    };
    loadingState = false;
    const tree = render({ initialTab: "inbox" });
    expect(textContent(tree)).toContain("Paused");
    expect(findOne(tree, (node) => node.type === PauseInboxFormMock).props.isPaused).toBe(true);
    expect(formatRelativeTime).toHaveBeenCalled();
  });

  test("successful toggle optimistically updates user and marks close refresh", async () => {
    activeTabState = "inbox";
    userState = defaultUser;
    loadingState = false;
    const onClose = mock(() => {});
    const tree = render({ initialTab: "inbox", onClose });
    const toggle = findOne(
      tree,
      (node) => node.type === ButtonMock && textContent(node) === "Close Inbox",
    );
    await toggle.props.onClick();
    expect(toggleInboxOpen).toHaveBeenCalledTimes(1);
    expect(setUser).toHaveBeenCalledWith({ ...defaultUser, inboxOpen: false });
    expect(toastSuccess).toHaveBeenCalledWith("Inbox closed successfully.");
    expect(needsRefreshRef.current).toBe(true);

    const overlay = findOne(
      tree,
      (node) => node.type === "button" && String(node.props.className).includes("absolute inset-0"),
    );
    overlay.props.onClick();
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(needsRefreshRef.current).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("declared toggle failure does not mutate user or schedule refresh", async () => {
    activeTabState = "inbox";
    userState = defaultUser;
    loadingState = false;
    toggleInboxOpen.mockImplementation(async () => ({
      success: false,
      message: "Cannot toggle",
    }));
    const tree = render({ initialTab: "inbox" });
    await findOne(tree, (node) => node.type === ButtonMock && textContent(node) === "Close Inbox").props.onClick();
    expect(toastError).toHaveBeenCalledWith("Cannot toggle");
    expect(setUser).not.toHaveBeenCalled();
    expect(needsRefreshRef.current).toBe(false);
  });

  test("thrown toggle failure is contained", async () => {
    activeTabState = "inbox";
    userState = defaultUser;
    loadingState = false;
    toggleInboxOpen.mockImplementation(async () => {
      throw new Error("backend down");
    });
    const tree = render({ initialTab: "inbox" });
    await expect(
      findOne(tree, (node) => node.type === ButtonMock && textContent(node) === "Close Inbox").props.onClick(),
    ).resolves.toBeUndefined();
    expect(toastError).toHaveBeenCalledWith("An error occurred.");
  });

  test("closing without changed inbox never refreshes", () => {
    userState = defaultUser;
    loadingState = false;
    const onClose = mock(() => {});
    const tree = render({ onClose });
    findOne(
      tree,
      (node) => node.type === "button" && String(node.props.className).includes("absolute inset-0"),
    ).props.onClick();
    expect(refresh).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("appearance controls", () => {
  beforeEach(() => {
    activeTabState = "appearance";
    userState = defaultUser;
    loadingState = false;
  });

  test.each([
    ["Light", "light"],
    ["System", "system"],
    ["Dark", "dark"],
  ])("%s button selects %s mode", async (label, expected) => {
    const tree = render();
    const button = findOne(
      tree,
      (node) => node.type === "button" && textContent(node) === label,
    );
    button.props.onClick();
    expect(setTheme).toHaveBeenCalledWith(expected);
  });

  test("accent catalog renders every option", () => {
    const tree = render();
    for (const label of ["Sky", "Sage", "Rose"]) {
      expect(textContent(tree)).toContain(label);
    }
  });

  test("accent option changes context theme", () => {
    const tree = render();
    const sage = findOne(
      tree,
      (node) => node.type === "button" && textContent(node).includes("Sage"),
    );
    sage.props.onClick();
    expect(setAccentTheme).toHaveBeenCalledWith("sage");
  });

  test("dark resolved theme uses dark reply preview color", () => {
    resolvedThemeState = "dark";
    const tree = render();
    const swatches = findAll(
      tree,
      (node) => node.type === "span" && node.props.style?.backgroundColor,
    );
    expect(swatches.some((node) => node.props.style.backgroundColor === "#1075ab")).toBe(true);
  });
});

describe("GitHub star effect", () => {
  test("requests repository stars once on mount", async () => {
    render();
    effects[2]();
    await Promise.resolve();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledWith("https://api.github.com/repos/electr1fy0/blindsay");
  });

  test("non-ok GitHub response does not set a star label", async () => {
    fetchMock.mockImplementation(async () => ({ ok: false, json: async () => ({ stargazers_count: 999 }) }) as any);
    render();
    effects[2]();
    await Promise.resolve();
    await Promise.resolve();
    expect(setStars).not.toHaveBeenCalled();
  });

  test("rejected GitHub fetch is contained", async () => {
    fetchMock.mockImplementation(async () => {
      throw new Error("offline");
    });
    render();
    expect(() => effects[2]()).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();
    expect(setStars).not.toHaveBeenCalled();
  });
});

process.on("exit", () => {
  globalThis.window = originalWindow;
  globalThis.fetch = originalFetch;
});
