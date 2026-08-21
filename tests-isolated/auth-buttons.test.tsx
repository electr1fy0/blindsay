import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, findOne, textContent } from "./react-tree";

let imageOkState = true;
const setImageOk = mock((_value: boolean) => {});
const useState = mock((_initial: any) => [imageOkState, setImageOk]);
const signIn = mock(async (_provider: string, _options?: any) => undefined);
const signOut = mock(async (_options?: any) => undefined);
const ButtonMock = (_props: any) => null;
const ImageMock = (_props: any) => null;

mock.module("react", () => ({ useState }));
mock.module("next-auth/react", () => ({ signIn, signOut }));
mock.module("@/components/ui/button", () => ({ Button: ButtonMock }));
mock.module("next/image", () => ({ default: ImageMock }));

const { AuthButtons } = await import("../components/auth-buttons");

beforeEach(() => {
  imageOkState = true;
  setImageOk.mockClear();
  useState.mockClear();
  signIn.mockClear();
  signOut.mockClear();
});

describe("signed-out AuthButtons", () => {
  test("uses Google and onboarding by default", async () => {
    const tree = AuthButtons({ user: null });
    const button = findOne(tree, (node) => node.type === ButtonMock);
    await button.props.onClick();
    expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/onboarding" });
  });

  test("forwards a custom callback URL", async () => {
    const tree = AuthButtons({ user: null, callbackUrl: "/alice" });
    await findOne(tree, (node) => node.type === ButtonMock).props.onClick();
    expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/alice" });
  });

  test("forwards custom size and variant", () => {
    const tree = AuthButtons({ user: null, size: "xs", variant: "ghost" as any });
    const button = findOne(tree, (node) => node.type === ButtonMock);
    expect(button.props.size).toBe("xs");
    expect(button.props.variant).toBe("ghost");
  });

  test("renders the default sign-in label", () => {
    expect(textContent(AuthButtons({ user: null }))).toContain("Sign in with Google");
  });

  test("renders arbitrary custom sign-in content", () => {
    const label = <strong>Continue</strong>;
    const tree = AuthButtons({ user: null, signInLabel: label });
    expect(textContent(tree)).toContain("Continue");
  });

  test("does not render a profile image for signed-out state", () => {
    expect(findAll(AuthButtons({ user: null }), (node) => node.type === ImageMock)).toHaveLength(0);
  });
});

describe("signed-in AuthButtons", () => {
  const user = {
    name: "alice wonder",
    email: "alice@example.test",
    image: "https://images.example/alice.png",
  };

  test("renders account identity and email", () => {
    const tree = AuthButtons({ user });
    const text = textContent(tree);
    expect(text).toContain("alice wonder");
    expect(text).toContain("alice@example.test");
  });

  test("renders the profile image while it is healthy", () => {
    const tree = AuthButtons({ user });
    const image = findOne(tree, (node) => node.type === ImageMock);
    expect(image.props.src).toBe(user.image);
    expect(image.props.alt).toBe(user.name);
    expect(image.props.width).toBe(40);
    expect(image.props.height).toBe(40);
  });

  test("marks the profile image bad after an image error", () => {
    const tree = AuthButtons({ user });
    findOne(tree, (node) => node.type === ImageMock).props.onError();
    expect(setImageOk).toHaveBeenCalledWith(false);
  });

  test("falls back to uppercase first initial after an image failure", () => {
    imageOkState = false;
    const tree = AuthButtons({ user });
    expect(findAll(tree, (node) => node.type === ImageMock)).toHaveLength(0);
    expect(textContent(tree)).toContain("A");
  });

  test("uses U when a signed-in user has no name", () => {
    imageOkState = false;
    const tree = AuthButtons({ user: { name: null, email: "anon@example.test", image: null } });
    expect(textContent(tree)).toContain("Signed in");
    expect(textContent(tree)).toContain("U");
  });

  test("uses Profile as the image alt when name is absent", () => {
    const tree = AuthButtons({
      user: { name: null, email: "anon@example.test", image: "https://images.example/u.png" },
    });
    expect(findOne(tree, (node) => node.type === ImageMock).props.alt).toBe("Profile");
  });

  test("signs out to the landing page", async () => {
    const tree = AuthButtons({ user });
    const button = findOne(
      tree,
      (node) => node.type === ButtonMock && textContent(node).includes("Sign out"),
    );
    await button.props.onClick();
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });

  test("forwards size and wrapper class in signed-in state", () => {
    const tree = AuthButtons({ user, size: "lg", className: "account-card" });
    const button = findOne(tree, (node) => node.type === ButtonMock);
    expect(button.props.size).toBe("lg");
    expect(tree.props.className).toContain("account-card");
  });
});
