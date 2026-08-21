import { describe, expect, test } from "bun:test";
import {
  getNextShellTheme,
  getSettingsClosePath,
  getSettingsState,
  getShellThemeLabel,
  getViewedUsername,
  isOwnerShellView,
  normalizeShellTheme,
  resolveShellUsername,
} from "../lib/app-shell-state";

describe("normalizeShellTheme", () => {
  test.each([
    ["light", "light"],
    ["dark", "dark"],
    ["system", "system"],
    [undefined, "system"],
    [null, "system"],
    ["", "system"],
    ["LIGHT", "system"],
    ["sepia", "system"],
  ])("normalizes %p to %p", (input, expected) => {
    expect(normalizeShellTheme(input)).toBe(expected);
  });
});

describe("theme cycling", () => {
  test.each([
    ["light", "dark"],
    ["dark", "system"],
    ["system", "light"],
    [undefined, "light"],
    [null, "light"],
    ["unknown", "light"],
  ])("cycles %p to %p", (input, expected) => {
    expect(getNextShellTheme(input)).toBe(expected);
  });

  test.each([
    ["light", "Light theme"],
    ["dark", "Dark theme"],
    ["system", "System theme"],
    [undefined, "System theme"],
    ["unknown", "System theme"],
  ])("labels %p as %p", (input, expected) => {
    expect(getShellThemeLabel(input)).toBe(expected);
  });
});

describe("getViewedUsername", () => {
  test.each([
    [undefined, undefined],
    [null, undefined],
    [{}, undefined],
    [{ username: undefined }, undefined],
    [{ username: null }, undefined],
    [{ username: ["alice"] }, undefined],
    [{ username: 123 }, undefined],
    [{ username: "" }, ""],
    [{ username: "Alice" }, "Alice"],
  ])("extracts username from %p", (input, expected) => {
    expect(getViewedUsername(input)).toBe(expected);
  });
});

describe("isOwnerShellView", () => {
  test("returns false without a claimed username", () => {
    expect(isOwnerShellView(undefined, null)).toBe(false);
    expect(isOwnerShellView("alice", undefined)).toBe(false);
    expect(isOwnerShellView("alice", "")).toBe(false);
  });

  test("treats non-profile app routes as owner context after claiming a username", () => {
    expect(isOwnerShellView(undefined, "alice")).toBe(true);
  });

  test("matches profile ownership case-insensitively", () => {
    expect(isOwnerShellView("ALICE", "alice")).toBe(true);
    expect(isOwnerShellView("Alice_1", "aLiCe_1")).toBe(true);
  });

  test("rejects another user's profile", () => {
    expect(isOwnerShellView("bob", "alice")).toBe(false);
  });
});

describe("resolveShellUsername", () => {
  test("prefers the username from route params", () => {
    expect(resolveShellUsername("bob", "alice")).toBe("bob");
  });

  test("falls back to the signed-in username", () => {
    expect(resolveShellUsername(undefined, "alice")).toBe("alice");
  });

  test("preserves null when neither route nor claimed username exists", () => {
    expect(resolveShellUsername(undefined, null)).toBeNull();
  });
});

describe("getSettingsState", () => {
  test("deep-links account route to account tab regardless of manual state", () => {
    expect(getSettingsState("/account", false)).toEqual({
      isOpen: true,
      tab: "account",
    });
    expect(getSettingsState("/account", true)).toEqual({
      isOpen: true,
      tab: "account",
    });
  });

  test("deep-links help route to support tab", () => {
    expect(getSettingsState("/help", false)).toEqual({
      isOpen: true,
      tab: "support",
    });
  });

  test("uses appearance for manually opened settings elsewhere", () => {
    expect(getSettingsState("/alice", true)).toEqual({
      isOpen: true,
      tab: "appearance",
    });
  });

  test("keeps settings closed elsewhere without manual open", () => {
    expect(getSettingsState("/analytics", false)).toEqual({
      isOpen: false,
      tab: "appearance",
    });
  });
});

describe("getSettingsClosePath", () => {
  test.each(["/account", "/help"])(
    "returns the profile after closing %s when username exists",
    (pathname) => {
      expect(getSettingsClosePath(pathname, "alice")).toBe("/alice");
    },
  );

  test.each(["/account", "/help"])(
    "falls back to home after closing %s without a username",
    (pathname) => {
      expect(getSettingsClosePath(pathname, null)).toBe("/");
      expect(getSettingsClosePath(pathname, undefined)).toBe("/");
      expect(getSettingsClosePath(pathname, "")).toBe("/");
    },
  );

  test("does not navigate when closing manually-opened settings elsewhere", () => {
    expect(getSettingsClosePath("/alice", "alice")).toBeNull();
    expect(getSettingsClosePath("/analytics", "alice")).toBeNull();
  });
});
