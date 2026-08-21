import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, findOne, textContent } from "./react-tree";

const redirect = mock((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const getServerSession = mock(async () => null as any);
const userFindUnique = mock(async (_args?: any) => null as any);
const toggleInboxOpen = mock(async () => ({ success: true }));
const formatRelativeTime = mock((_date: Date, _now: Date) => "in 2 hours");
const fetchGitHubStarCount = mock(async () => null as number | null);
const formatGitHubStarCount = mock((count: number | null) =>
  count === null ? null : String(count),
);

const AuthButtonsMock = (_props: any) => null;
const UsernameFormMock = (_props: any) => null;
const HiddenWordsFormMock = (_props: any) => null;
const PauseInboxFormMock = (_props: any) => null;
const DeleteAccountButtonMock = (_props: any) => null;
const SharePanelMock = (_props: any) => null;
const CardMock = (_props: any) => null;
const CardContentMock = (_props: any) => null;
const CardHeaderMock = (_props: any) => null;
const ButtonMock = (_props: any) => null;
const HugeiconsIconMock = (_props: any) => null;
const LinkMock = (_props: any) => null;

mock.module("next/navigation", () => ({ redirect }));
mock.module("next-auth", () => ({ getServerSession }));
mock.module("@/auth", () => ({ authOptions: {} }));
mock.module("@/lib/prisma", () => ({ prisma: { user: { findUnique: userFindUnique } } }));
mock.module("@/app/actions", () => ({ toggleInboxOpen }));
mock.module("@/lib/relative-time", () => ({ formatRelativeTime }));
mock.module("@/lib/github-stars", () => ({
  fetchGitHubStarCount,
  formatGitHubStarCount,
}));
mock.module("@/components/auth-buttons", () => ({ AuthButtons: AuthButtonsMock }));
mock.module("@/components/username-form", () => ({ UsernameForm: UsernameFormMock }));
mock.module("@/components/hidden-words-form", () => ({ HiddenWordsForm: HiddenWordsFormMock }));
mock.module("@/components/pause-inbox-form", () => ({ PauseInboxForm: PauseInboxFormMock }));
mock.module("@/components/delete-account-button", () => ({ DeleteAccountButton: DeleteAccountButtonMock }));
mock.module("@/components/share-panel", () => ({ SharePanel: SharePanelMock }));
mock.module("@/components/ui/card", () => ({
  Card: CardMock,
  CardContent: CardContentMock,
  CardHeader: CardHeaderMock,
}));
mock.module("@/components/ui/button", () => ({ Button: ButtonMock }));
mock.module("@hugeicons/react", () => ({ HugeiconsIcon: HugeiconsIconMock }));
mock.module("@hugeicons/core-free-icons", () => ({
  ToggleOffIcon: {},
  ToggleOnIcon: {},
  GithubIcon: {},
  StarIcon: {},
}));
mock.module("next/link", () => ({ default: LinkMock }));

const AccountPage = (await import("../app/(app)/account/page")).default;

const session = {
  user: {
    id: "owner-1",
    email: "owner@example.test",
    name: "Owner",
    image: null,
  },
};
const baseUser = {
  id: "owner-1",
  username: "alice",
  name: "Owner",
  email: "owner@example.test",
  inboxOpen: true,
  inboxPausedUntil: null as Date | null,
  hiddenWords: ["secret"],
};

beforeEach(() => {
  redirect.mockClear();
  getServerSession.mockClear();
  getServerSession.mockImplementation(async () => session);
  userFindUnique.mockClear();
  userFindUnique.mockImplementation(async () => ({ ...baseUser }));
  toggleInboxOpen.mockClear();
  toggleInboxOpen.mockImplementation(async () => ({ success: true }));
  formatRelativeTime.mockClear();
  formatRelativeTime.mockImplementation(() => "in 2 hours");
  fetchGitHubStarCount.mockClear();
  fetchGitHubStarCount.mockImplementation(async () => null);
  formatGitHubStarCount.mockClear();
  formatGitHubStarCount.mockImplementation((count) =>
    count === null ? null : String(count),
  );
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_URL;
});

describe("account access and lookup", () => {
  test("redirects anonymous visitors before any database or GitHub work", async () => {
    getServerSession.mockImplementation(async () => null);
    await expect(AccountPage()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(userFindUnique).not.toHaveBeenCalled();
    expect(fetchGitHubStarCount).not.toHaveBeenCalled();
  });

  test("redirects sessions with no email", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "owner-1" } }));
    await expect(AccountPage()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  test("queries the complete account-settings projection by email", async () => {
    await AccountPage();
    expect(userFindUnique).toHaveBeenCalledWith({
      where: { email: "owner@example.test" },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        inboxOpen: true,
        inboxPausedUntil: true,
        hiddenWords: true,
      },
    });
  });

  test("redirects a stale session whose user no longer exists", async () => {
    userFindUnique.mockImplementation(async () => null);
    await expect(AccountPage()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(fetchGitHubStarCount).not.toHaveBeenCalled();
  });
});

describe("identity and sharing", () => {
  test("passes the authenticated session user to AuthButtons", async () => {
    const tree = await AccountPage();
    const auth = findOne(tree, (node) => node.type === AuthButtonsMock);
    expect(auth.props.user).toBe(session.user);
    expect(auth.props.size).toBe("sm");
  });

  test("uses update copy for a claimed username", async () => {
    const tree = await AccountPage();
    const form = findOne(tree, (node) => node.type === UsernameFormMock);
    expect(form.props.initialValue).toBe("alice");
    expect(form.props.submitLabel).toBe("Update username");
  });

  test("uses claim copy and omits sharing for an unclaimed username", async () => {
    userFindUnique.mockImplementation(async () => ({ ...baseUser, username: null }));
    const tree = await AccountPage();
    const form = findOne(tree, (node) => node.type === UsernameFormMock);
    expect(form.props.initialValue).toBe("");
    expect(form.props.submitLabel).toBe("Claim username");
    expect(findAll(tree, (node) => node.type === SharePanelMock)).toHaveLength(0);
  });

  test("normalizes the profile URL before passing it to SharePanel", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test////";
    const tree = await AccountPage();
    const panel = findOne(tree, (node) => node.type === SharePanelMock);
    expect(panel.props.url).toBe("https://example.test/alice");
    expect(panel.props.orientation).toBe("horizontal");
  });
});

describe("inbox state", () => {
  test("shows active state for an open unpaused inbox", async () => {
    const tree = await AccountPage();
    expect(textContent(tree)).toContain("Active");
    expect(textContent(tree)).toContain("Accepting new messages.");
    expect(findOne(tree, (node) => node.type === PauseInboxFormMock).props.isPaused).toBe(false);
  });

  test("shows closed state and open-inbox button for a closed inbox", async () => {
    userFindUnique.mockImplementation(async () => ({ ...baseUser, inboxOpen: false }));
    const tree = await AccountPage();
    expect(textContent(tree)).toContain("Closed");
    expect(textContent(tree)).toContain("Not accepting messages.");
    const button = findOne(tree, (node) => node.type === ButtonMock && node.props.title === "Open inbox");
    expect(button.props.variant).toBe("default");
  });

  test("shows paused state only when the pause is still in the future", async () => {
    const future = new Date(Date.now() + 60_000);
    userFindUnique.mockImplementation(async () => ({
      ...baseUser,
      inboxPausedUntil: future,
    }));
    const tree = await AccountPage();
    expect(textContent(tree)).toContain("Paused");
    expect(findOne(tree, (node) => node.type === PauseInboxFormMock).props.isPaused).toBe(true);
    expect(formatRelativeTime).toHaveBeenCalled();
  });

  test("treats an expired pause as ready", async () => {
    userFindUnique.mockImplementation(async () => ({
      ...baseUser,
      inboxPausedUntil: new Date(Date.now() - 60_000),
    }));
    const tree = await AccountPage();
    expect(findOne(tree, (node) => node.type === PauseInboxFormMock).props.isPaused).toBe(false);
    expect(textContent(tree)).toContain("Ready");
  });

  test("wires the server form action to toggleInboxOpen", async () => {
    const tree = await AccountPage();
    const form = findOne(
      tree,
      (node) => node.type === "form" && typeof node.props.action === "function",
    );
    await form.props.action();
    expect(toggleInboxOpen).toHaveBeenCalledTimes(1);
  });
});

describe("moderation, stars, and danger zone", () => {
  test("passes stored hidden words to the moderation form", async () => {
    const tree = await AccountPage();
    expect(findOne(tree, (node) => node.type === HiddenWordsFormMock).props.initialValue).toEqual([
      "secret",
    ]);
  });

  test("defensively falls back to an empty hidden-word list", async () => {
    userFindUnique.mockImplementation(async () => ({ ...baseUser, hiddenWords: null as any }));
    const tree = await AccountPage();
    expect(findOne(tree, (node) => node.type === HiddenWordsFormMock).props.initialValue).toEqual([]);
  });

  test("fetches and formats GitHub stars through hardened helpers", async () => {
    fetchGitHubStarCount.mockImplementation(async () => 1234);
    formatGitHubStarCount.mockImplementation(() => "1.2k");
    const tree = await AccountPage();
    expect(fetchGitHubStarCount).toHaveBeenCalledTimes(1);
    expect(formatGitHubStarCount).toHaveBeenCalledWith(1234);
    expect(textContent(tree)).toContain("1.2k");
  });

  test("omits the star number when lookup fails", async () => {
    fetchGitHubStarCount.mockImplementation(async () => null);
    formatGitHubStarCount.mockImplementation(() => null);
    const tree = await AccountPage();
    expect(textContent(tree)).toContain("Star on GitHub");
    expect(textContent(tree)).not.toContain("null");
  });

  test("always renders the destructive account-delete control", async () => {
    const tree = await AccountPage();
    expect(findAll(tree, (node) => node.type === DeleteAccountButtonMock)).toHaveLength(1);
  });
});
