import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, findOne, textContent } from "./react-tree";

const redirect = mock((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const getServerSession = mock(async () => null as any);
const userFindUnique = mock(async (_args?: any) => null as any);

const SharePanelMock = (_props: any) => null;
const UsernameFormMock = (_props: any) => null;
const AuthButtonsMock = (_props: any) => null;
const ImageMock = (_props: any) => null;

mock.module("next/navigation", () => ({ redirect }));
mock.module("next-auth", () => ({ getServerSession }));
mock.module("@/auth", () => ({ authOptions: {} }));
mock.module("@/lib/prisma", () => ({ prisma: { user: { findUnique: userFindUnique } } }));
mock.module("@/components/share-panel", () => ({ SharePanel: SharePanelMock }));
mock.module("@/components/username-form", () => ({ UsernameForm: UsernameFormMock }));
mock.module("@/components/auth-buttons", () => ({ AuthButtons: AuthButtonsMock }));
mock.module("next/image", () => ({ default: ImageMock }));

const PublishedPage = (await import("../app/(app)/published/page")).default;
const SharePage = (await import("../app/(app)/share/page")).default;
const OnboardingPage = (await import("../app/onboarding/page")).default;

beforeEach(() => {
  redirect.mockClear();
  getServerSession.mockClear();
  getServerSession.mockImplementation(async () => null);
  userFindUnique.mockClear();
  userFindUnique.mockImplementation(async () => null);
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_URL;
});

describe("PublishedPage", () => {
  test("redirects unauthenticated visitors without a database read", async () => {
    await expect(PublishedPage()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  test("redirects sessions without an email", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "owner" } }));
    await expect(PublishedPage()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  test("queries username by the authenticated email", async () => {
    getServerSession.mockImplementation(async () => ({ user: { email: "a@example.test" } }));
    userFindUnique.mockImplementation(async () => ({ username: null }));
    await expect(PublishedPage()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(userFindUnique).toHaveBeenCalledWith({
      where: { email: "a@example.test" },
      select: { username: true },
    });
  });

  test("redirects users without a claimed username to home", async () => {
    getServerSession.mockImplementation(async () => ({ user: { email: "a@example.test" } }));
    userFindUnique.mockImplementation(async () => ({ username: "" }));
    await expect(PublishedPage()).rejects.toThrow("NEXT_REDIRECT:/");
  });

  test("redirects claimed users to their published inbox filter", async () => {
    getServerSession.mockImplementation(async () => ({ user: { email: "a@example.test" } }));
    userFindUnique.mockImplementation(async () => ({ username: "alice_1" }));
    await expect(PublishedPage()).rejects.toThrow(
      "NEXT_REDIRECT:/alice_1?filter=published",
    );
  });
});

describe("SharePage", () => {
  test("redirects unauthenticated visitors before querying the user", async () => {
    await expect(SharePage()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  test("queries only id and username for the authenticated email", async () => {
    getServerSession.mockImplementation(async () => ({ user: { email: "share@example.test" } }));
    userFindUnique.mockImplementation(async () => ({ id: "u1", username: null }));
    await expect(SharePage()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(userFindUnique).toHaveBeenCalledWith({
      where: { email: "share@example.test" },
      select: { id: true, username: true },
    });
  });

  test("redirects a missing database user", async () => {
    getServerSession.mockImplementation(async () => ({ user: { email: "share@example.test" } }));
    userFindUnique.mockImplementation(async () => null);
    await expect(SharePage()).rejects.toThrow("NEXT_REDIRECT:/");
  });

  test("redirects a user without a username", async () => {
    getServerSession.mockImplementation(async () => ({ user: { email: "share@example.test" } }));
    userFindUnique.mockImplementation(async () => ({ id: "u1", username: null }));
    await expect(SharePage()).rejects.toThrow("NEXT_REDIRECT:/");
  });

  test("renders a normalized public profile URL", async () => {
    getServerSession.mockImplementation(async () => ({ user: { email: "share@example.test" } }));
    userFindUnique.mockImplementation(async () => ({ id: "u1", username: "alice" }));
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test////";
    const tree = await SharePage();
    const panel = findOne(tree, (node) => node.type === SharePanelMock);
    expect(panel.props).toEqual({
      url: "https://example.test/alice",
      orientation: "horizontal",
    });
  });

  test("uses Vercel when the public URL is blank", async () => {
    getServerSession.mockImplementation(async () => ({ user: { email: "share@example.test" } }));
    userFindUnique.mockImplementation(async () => ({ id: "u1", username: "alice" }));
    process.env.NEXT_PUBLIC_SITE_URL = " ";
    process.env.VERCEL_URL = "preview.vercel.app/";
    const tree = await SharePage();
    expect(findOne(tree, (node) => node.type === SharePanelMock).props.url).toBe(
      "https://preview.vercel.app/alice",
    );
  });
});

describe("OnboardingPage", () => {
  test("renders sign-in UI without querying Prisma for anonymous visitors", async () => {
    const tree = await OnboardingPage();
    expect(userFindUnique).not.toHaveBeenCalled();
    expect(textContent(tree)).toContain("Sign in to continue");
    const auth = findOne(tree, (node) => node.type === AuthButtonsMock);
    expect(auth.props.user).toBeNull();
  });

  test("queries the viewer by email after authentication", async () => {
    getServerSession.mockImplementation(async () => ({ user: { email: "new@example.test" } }));
    await OnboardingPage();
    expect(userFindUnique).toHaveBeenCalledWith({
      where: { email: "new@example.test" },
      select: { username: true },
    });
  });

  test("redirects an already-onboarded user to their inbox", async () => {
    getServerSession.mockImplementation(async () => ({ user: { email: "old@example.test" } }));
    userFindUnique.mockImplementation(async () => ({ username: "alice" }));
    await expect(OnboardingPage()).rejects.toThrow("NEXT_REDIRECT:/alice");
  });

  test("renders the username claim flow when the user record is missing", async () => {
    getServerSession.mockImplementation(async () => ({ user: { email: "new@example.test" } }));
    userFindUnique.mockImplementation(async () => null);
    const tree = await OnboardingPage();
    expect(textContent(tree)).toContain("Claim your username");
    const form = findOne(tree, (node) => node.type === UsernameFormMock);
    expect(form.props.submitLabel).toBe("Claim username");
  });

  test("renders the claim flow for an existing user with no username", async () => {
    getServerSession.mockImplementation(async () => ({ user: { email: "new@example.test" } }));
    userFindUnique.mockImplementation(async () => ({ username: null }));
    const tree = await OnboardingPage();
    expect(findAll(tree, (node) => node.type === UsernameFormMock)).toHaveLength(1);
  });
});
