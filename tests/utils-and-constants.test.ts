import { describe, expect, test } from "bun:test";
import { RESERVED_USERNAMES } from "../lib/constants";
import { cn } from "../lib/utils";

describe("RESERVED_USERNAMES", () => {
  test("contains every application route that must not become a profile", () => {
    expect(RESERVED_USERNAMES).toEqual(expect.arrayContaining([
      "account",
      "analytics",
      "api",
      "help",
      "onboarding",
      "published",
      "settings",
      "privacy",
    ]));
  });

  test("contains common authentication and administrative names", () => {
    expect(RESERVED_USERNAMES).toEqual(expect.arrayContaining([
      "admin",
      "login",
      "register",
      "logout",
      "signin",
      "signout",
    ]));
  });

  test("is lowercase so normalized username checks remain correct", () => {
    expect(RESERVED_USERNAMES.every((name) => name === name.toLowerCase())).toBe(true);
  });

  test("does not contain duplicates", () => {
    expect(new Set(RESERVED_USERNAMES).size).toBe(RESERVED_USERNAMES.length);
  });
});

describe("cn", () => {
  test("joins ordinary class names", () => {
    expect(cn("one", "two")).toBe("one two");
  });

  test("drops falsey conditional classes", () => {
    expect(cn("base", false && "hidden", null, undefined, "active")).toBe("base active");
  });

  test("accepts object-style clsx input", () => {
    expect(cn({ visible: true, hidden: false }, "extra")).toBe("visible extra");
  });

  test("flattens nested arrays", () => {
    expect(cn(["one", ["two", false]], "three")).toBe("one two three");
  });

  test("resolves conflicting Tailwind padding utilities in favor of the later class", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  test("resolves conflicting text colors", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  test("preserves non-conflicting Tailwind utilities", () => {
    expect(cn("px-2", "py-4", "font-medium")).toBe("px-2 py-4 font-medium");
  });

  test("returns an empty string for no meaningful classes", () => {
    expect(cn(null, undefined, false)).toBe("");
  });
});
