import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, findOne, textContent } from "./react-tree";

let pathname = "/analytics";
let params: any = {};
let manualOpen = false;
let theme: string | undefined = "system";
const setManualOpen = mock((_value: boolean) => {});
const useState = mock((_initial: any) => [manualOpen, setManualOpen]);
const push = mock((_path: string) => {});
const usePathname = mock(() => pathname);
const useParams = mock(() => params);
const useRouter = mock(() => ({ push }));
const setTheme = mock((_theme: string) => {});
const useTheme = mock(() => ({ theme, setTheme }));

const LinkMock = (_props: any) => null;
const ImageMock = (_props: any) => null;
const HugeiconsIconMock = (_props: any) => null;
const SettingsDialogMock = (_props: any) => null;
const MotionDivMock = (_props: any) => null;
const LayoutGroupMock = (_props: any) => null;

mock.module("react", () => ({ useState }));
mock.module("next/navigation", () => ({ usePathname, useParams, useRouter }));
mock.module("next-themes", () => ({ useTheme }));
mock.module("next/link", () => ({ default: LinkMock }));
mock.module("next/image", () => ({ default: ImageMock }));
mock.module("@hugeicons/react", () => ({ HugeiconsIcon: HugeiconsIconMock }));
mock.module("@hugeicons/core-free-icons", () => ({
  Notification03Icon: { id: "notification" },
  Analytics01Icon: { id: "analytics" },
  LaptopIcon: { id: "laptop" },
  Moon02Icon: { id: "moon" },
  Sun03Icon: { id: "sun" },
}));
mock.module("@/components/settings-dialog", () => ({
  SettingsDialog: SettingsDialogMock,
}));
mock.module("motion/react", () => ({
  motion: { div: MotionDivMock },
  LayoutGroup: LayoutGroupMock,
}));

const { AppShell } = await import("../components/app-shell");

const owner = {
  username: "alice",
  email: "alice@example.test",
  image: null,
};

beforeEach(() => {
  pathname = "/analytics";
  params = {};
  manualOpen = false;
  theme = "system";
  setManualOpen.mockClear();
  push.mockClear();
  usePathname.mockClear();
  useParams.mockClear();
  useRouter.mockClear();
  setTheme.mockClear();
  useTheme.mockClear();
});

describe("AppShell ownership branches", () => {
  test("uses owner chrome on app routes when signed-in user has a username", () => {
    const tree = AppShell({ children: "content", user: owner });
    expect(findAll(tree, (node) => node.type === SettingsDialogMock)).toHaveLength(1);
    expect(textContent(tree)).toContain("Inbox");
    expect(textContent(tree)).toContain("Analytics");
  });

  test("matches own profile case-insensitively", () => {
    pathname = "/ALICE";
    params = { username: "ALICE" };
    const tree = AppShell({ children: "own", user: owner });
    expect(findAll(tree, (node) => node.type === SettingsDialogMock)).toHaveLength(1);
  });

  test("uses visitor chrome on another user's profile", () => {
    pathname = "/bob";
    params = { username: "bob" };
    const tree = AppShell({ children: "visitor", user: owner });
    expect(findAll(tree, (node) => node.type === SettingsDialogMock)).toHaveLength(0);
    expect(textContent(tree)).toContain("BLINDSAY");
    const logo = findOne(
      tree,
      (node) => node.type === ImageMock && node.props.src === "/blindsay.png",
    );
    expect(logo.props.alt).toBe("BLINDSAY logo");
  });

  test("uses visitor chrome for users who have not claimed a username", () => {
    const tree = AppShell({
      children: "claim first",
      user: { username: null, email: "new@example.test", image: null },
    });
    expect(findAll(tree, (node) => node.type === SettingsDialogMock)).toHaveLength(0);
  });

  test("uses visitor chrome with no user", () => {
    params = { username: "alice" };
    pathname = "/alice";
    const tree = AppShell({ children: "public", user: null });
    expect(findAll(tree, (node) => node.type === SettingsDialogMock)).toHaveLength(0);
  });
});

describe("owner profile control", () => {
  test("renders user image when available", () => {
    const tree = AppShell({
      children: "content",
      user: { ...owner, image: "https://images.example/alice.png" },
    });
    const image = findOne(
      tree,
      (node) => node.type === ImageMock && node.props.src === "https://images.example/alice.png",
    );
    expect(image.props.alt).toBe("alice");
    expect(image.props.width).toBe(28);
    expect(image.props.height).toBe(28);
  });

  test("falls back to uppercase username initial without an image", () => {
    const tree = AppShell({ children: "content", user: owner });
    expect(textContent(tree)).toContain("A");
  });

  test("clicking account avatar opens settings manually", () => {
    const tree = AppShell({ children: "content", user: owner });
    const accountButton = findOne(
      tree,
      (node) => node.type === "button" && node.props.title === "Account Settings",
    );
    accountButton.props.onClick();
    expect(setManualOpen).toHaveBeenCalledWith(true);
  });
});

describe("navigation wiring", () => {
  test("inbox link targets the claimed username", () => {
    const tree = AppShell({ children: "content", user: owner });
    const hrefs = findAll(tree, (node) => node.type === LinkMock).map(
      (node) => node.props.href,
    );
    expect(hrefs).toContain("/alice");
    expect(hrefs).toContain("/analytics");
  });

  test("active analytics route renders the shared active-tab marker", () => {
    pathname = "/analytics";
    const tree = AppShell({ children: "content", user: owner });
    expect(
      findAll(
        tree,
        (node) => node.type === MotionDivMock && node.props.layoutId === "active-tab",
      ),
    ).toHaveLength(1);
  });

  test("active inbox route renders the shared active-tab marker", () => {
    pathname = "/alice";
    params = { username: "alice" };
    const tree = AppShell({ children: "content", user: owner });
    expect(
      findAll(
        tree,
        (node) => node.type === MotionDivMock && node.props.layoutId === "active-tab",
      ),
    ).toHaveLength(1);
  });
});

describe("settings deep links", () => {
  test("account route opens account tab even without manual state", () => {
    pathname = "/account";
    const tree = AppShell({ children: "content", user: owner });
    const dialog = findOne(tree, (node) => node.type === SettingsDialogMock);
    expect(dialog.props.isOpen).toBe(true);
    expect(dialog.props.initialTab).toBe("account");
  });

  test("help route opens support tab", () => {
    pathname = "/help";
    const tree = AppShell({ children: "content", user: owner });
    const dialog = findOne(tree, (node) => node.type === SettingsDialogMock);
    expect(dialog.props.isOpen).toBe(true);
    expect(dialog.props.initialTab).toBe("support");
  });

  test("manual open elsewhere uses appearance tab", () => {
    manualOpen = true;
    pathname = "/analytics";
    const tree = AppShell({ children: "content", user: owner });
    const dialog = findOne(tree, (node) => node.type === SettingsDialogMock);
    expect(dialog.props.isOpen).toBe(true);
    expect(dialog.props.initialTab).toBe("appearance");
  });

  test("closing account deep link returns to profile and resets manual state", () => {
    pathname = "/account";
    const tree = AppShell({ children: "content", user: owner });
    findOne(tree, (node) => node.type === SettingsDialogMock).props.onClose();
    expect(setManualOpen).toHaveBeenCalledWith(false);
    expect(push).toHaveBeenCalledWith("/alice");
  });

  test("closing manual settings on analytics does not navigate", () => {
    manualOpen = true;
    pathname = "/analytics";
    const tree = AppShell({ children: "content", user: owner });
    findOne(tree, (node) => node.type === SettingsDialogMock).props.onClose();
    expect(setManualOpen).toHaveBeenCalledWith(false);
    expect(push).not.toHaveBeenCalled();
  });
});

describe("theme button", () => {
  function themeButton(tree: any) {
    return findOne(
      tree,
      (node) =>
        node.type === "button" &&
        typeof node.props["aria-label"] === "string" &&
        node.props["aria-label"].includes("theme"),
    );
  }

  test.each([
    ["light", "Light theme", "dark"],
    ["dark", "Dark theme", "system"],
    ["system", "System theme", "light"],
  ])("cycles %s using label %s", (current, label, next) => {
    theme = current;
    const button = themeButton(AppShell({ children: "content", user: owner }));
    expect(button.props.title).toBe(label);
    expect(button.props["aria-label"]).toBe(label);
    button.props.onClick();
    expect(setTheme).toHaveBeenCalledWith(next);
  });

  test("unknown theme falls back to system label/icon cycle instead of undefined", () => {
    theme = "sepia";
    const tree = AppShell({ children: "content", user: owner });
    const button = themeButton(tree);
    expect(button.props.title).toBe("System theme");
    button.props.onClick();
    expect(setTheme).toHaveBeenCalledWith("light");
  });
});

describe("reserved username defense", () => {
  test("shows a warning if legacy data contains a reserved username", () => {
    const tree = AppShell({
      children: "content",
      user: { ...owner, username: "account" },
    });
    expect(textContent(tree)).toContain("Your username is reserved.");
  });

  test("does not show the warning for a normal username", () => {
    const tree = AppShell({ children: "content", user: owner });
    expect(textContent(tree)).not.toContain("Your username is reserved.");
  });
});
