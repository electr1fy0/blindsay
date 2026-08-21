import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, findOne, textContent } from "./react-tree";

const redirect = mock((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const getServerSession = mock(async () => null as any);
const userFindUnique = mock(async (_args?: any) => null as any);
const fetchMock = mock(async (_input: any, _init?: any) => ({
  ok: true,
  json: async () => ({ stargazers_count: 42 }),
}) as any);
const consoleError = mock((..._args: any[]) => {});

const ComponentMock = (_props: any) => null;
const LinkMock = (_props: any) => null;
const ImageMock = (_props: any) => null;
const AuthButtonsMock = (_props: any) => null;
const LandingFaqMock = (_props: any) => null;
const HoverBorderGradientMock = (_props: any) => null;
const FloatingNavMock = (_props: any) => null;
const StaggerContainerMock = (_props: any) => null;
const StaggerItemMock = (_props: any) => null;
const ScrollRevealMock = (_props: any) => null;

mock.module("next/navigation", () => ({ redirect }));
mock.module("next-auth", () => ({ getServerSession }));
mock.module("@/auth", () => ({ authOptions: { marker: "auth" } }));
mock.module("@/lib/prisma", () => ({
  prisma: { user: { findUnique: userFindUnique } },
}));
mock.module("next/link", () => ({ default: LinkMock }));
mock.module("next/image", () => ({ default: ImageMock }));
mock.module("@/components/auth-buttons", () => ({ AuthButtons: AuthButtonsMock }));
mock.module("@/components/landing-faq", () => ({ LandingFaq: LandingFaqMock }));
mock.module("@/components/ui/button-variants", () => ({
  buttonVariants: mock((_options: any) => "button-classes"),
}));
mock.module("@/lib/utils", () => ({
  cn: (...values: any[]) => values.filter(Boolean).join(" "),
}));
mock.module("@/components/ui/canvas-text", () => ({ CanvasText: ComponentMock }));
mock.module("@/components/ui/dotted-glow-background", () => ({ DottedGlowBackground: ComponentMock }));
mock.module("@/components/ui/background-ripple-effect", () => ({ BackgroundRippleEffect: ComponentMock }));
mock.module("@/components/ui/hover-border-gradient", () => ({ HoverBorderGradient: HoverBorderGradientMock }));
mock.module("@/components/ui/floating-hero-svgs", () => ({ FloatingHeroSvgs: ComponentMock }));
mock.module("@/components/ui/wobble-card", () => ({ WobbleCard: ComponentMock }));
mock.module("@/components/ui/hero-reveal", () => ({
  StaggerContainer: StaggerContainerMock,
  StaggerItem: StaggerItemMock,
  ScrollReveal: ScrollRevealMock,
}));
mock.module("@/components/ui/floating-navbar", () => ({ FloatingNav: FloatingNavMock }));
mock.module("@/components/ui/animated-icons", () => ({
  AnimatedLinkIcon: ComponentMock,
  AnimatedInboxIcon: ComponentMock,
  AnimatedFilterIcon: ComponentMock,
  AnimatedPauseToggle: ComponentMock,
  AnimatedReplyControlIcon: ComponentMock,
  AnimatedHiddenWordsWidget: ComponentMock,
  AnimatedPauseInboxWidget: ComponentMock,
  AnimatedReplyControlWidget: ComponentMock,
}));
mock.module("@/components/ui/how-it-works-timeline", () => ({ HowItWorksTimeline: ComponentMock }));

const LandingPage = (await import("../app/page")).default;

const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;

beforeEach(() => {
  redirect.mockClear();
  getServerSession.mockClear();
  getServerSession.mockImplementation(async () => null);
  userFindUnique.mockClear();
  userFindUnique.mockImplementation(async () => null);
  fetchMock.mockClear();
  fetchMock.mockImplementation(async () => ({
    ok: true,
    json: async () => ({ stargazers_count: 42 }),
  }) as any);
  consoleError.mockClear();
  globalThis.fetch = fetchMock as any;
  console.error = consoleError as any;
});

describe("landing authentication routing", () => {
  test("reads the server session with app auth options", async () => {
    await LandingPage();
    expect(getServerSession).toHaveBeenCalledWith({ marker: "auth" });
  });

  test("anonymous visitors never query a user record", async () => {
    await LandingPage();
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  test("session without email behaves like an anonymous visitor", async () => {
    getServerSession.mockImplementation(async () => ({ user: { id: "u1" } }));
    const tree = await LandingPage();
    expect(userFindUnique).not.toHaveBeenCalled();
    expect(findAll(tree, (node) => node.type === AuthButtonsMock).length).toBeGreaterThan(0);
  });

  test("authenticated viewer is queried by email with minimal projection", async () => {
    getServerSession.mockImplementation(async () => ({
      user: { email: "alice@example.test" },
    }));
    userFindUnique.mockImplementation(async () => ({ username: null, name: "Alice" }));
    await expect(LandingPage()).rejects.toThrow("NEXT_REDIRECT:/onboarding");
    expect(userFindUnique).toHaveBeenCalledWith({
      where: { email: "alice@example.test" },
      select: { username: true, name: true },
    });
  });

  test("claimed users redirect straight to their profile before external fetch", async () => {
    getServerSession.mockImplementation(async () => ({
      user: { email: "alice@example.test" },
    }));
    userFindUnique.mockImplementation(async () => ({ username: "alice", name: "Alice" }));
    await expect(LandingPage()).rejects.toThrow("NEXT_REDIRECT:/alice");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("unclaimed users redirect to onboarding before external fetch", async () => {
    getServerSession.mockImplementation(async () => ({
      user: { email: "alice@example.test" },
    }));
    userFindUnique.mockImplementation(async () => ({ username: null, name: "Alice" }));
    await expect(LandingPage()).rejects.toThrow("NEXT_REDIRECT:/onboarding");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("missing user record for authenticated email also enters onboarding", async () => {
    getServerSession.mockImplementation(async () => ({
      user: { email: "new@example.test" },
    }));
    userFindUnique.mockImplementation(async () => null);
    await expect(LandingPage()).rejects.toThrow("NEXT_REDIRECT:/onboarding");
  });
});

describe("landing GitHub star lookup", () => {
  test("uses one-hour revalidation and a stable User-Agent", async () => {
    await LandingPage();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/electr1fy0/blindsay",
      {
        next: { revalidate: 3600 },
        headers: { "User-Agent": "blindsay-app" },
      },
    );
  });

  test("renders a positive star count from an ok response", async () => {
    fetchMock.mockImplementation(async () => ({
      ok: true,
      json: async () => ({ stargazers_count: 321 }),
    }) as any);
    const tree = await LandingPage();
    const badge = findOne(tree, (node) => node.type === HoverBorderGradientMock);
    expect(textContent(badge)).toContain("321");
  });

  test("hides star count for zero", async () => {
    fetchMock.mockImplementation(async () => ({
      ok: true,
      json: async () => ({ stargazers_count: 0 }),
    }) as any);
    const tree = await LandingPage();
    const badge = findOne(tree, (node) => node.type === HoverBorderGradientMock);
    expect(textContent(badge)).toBe("GitHub");
  });

  test("does not parse response body when GitHub returns non-ok", async () => {
    const json = mock(async () => ({ stargazers_count: 999 }));
    fetchMock.mockImplementation(async () => ({ ok: false, json }) as any);
    await LandingPage();
    expect(json).not.toHaveBeenCalled();
  });

  test("contains a rejected fetch and still renders the landing page", async () => {
    fetchMock.mockImplementation(async () => {
      throw new Error("network down");
    });
    const tree = await LandingPage();
    expect(textContent(tree)).toContain("Receive the unsaid words");
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  test("contains invalid JSON from an otherwise-ok response", async () => {
    fetchMock.mockImplementation(async () => ({
      ok: true,
      json: async () => {
        throw new SyntaxError("bad json");
      },
    }) as any);
    await expect(LandingPage()).resolves.toBeDefined();
    expect(consoleError).toHaveBeenCalledTimes(1);
  });
});

describe("landing call-to-action wiring", () => {
  test("anonymous landing wires the floating CTA to sign in", async () => {
    const tree = await LandingPage();
    const nav = findOne(tree, (node) => node.type === FloatingNavMock);
    expect(nav.props.cta.type).toBe(AuthButtonsMock);
    expect(nav.props.cta.props.user).toBeNull();
    expect(nav.props.cta.props.signInLabel).toBe("Start inbox");

    const inlineAuthButtons = findAll(tree, (node) => node.type === AuthButtonsMock);
    expect(inlineAuthButtons.length).toBeGreaterThan(0);
  });

  test("floating navigation receives How it works and FAQ anchors", async () => {
    const tree = await LandingPage();
    const nav = findOne(tree, (node) => node.type === FloatingNavMock);
    expect(nav.props.navItems).toEqual([
      { name: "How it works", link: "#how-it-works" },
      { name: "FAQ", link: "#faq" },
    ]);
  });

  test("FAQ receives the complete six-question catalog", async () => {
    const tree = await LandingPage();
    const faq = findOne(tree, (node) => node.type === LandingFaqMock);
    expect(faq.props.questions).toHaveLength(6);
    expect(faq.props.questions[0].title).toBe("Can anyone see messages sent to me?");
    expect(faq.props.questions[5].title).toBe("Is the platform free to use?");
  });
});

process.on("exit", () => {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
});
