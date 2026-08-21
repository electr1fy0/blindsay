import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findOne } from "./react-tree";

let stateValue: any = "sky";
let stateInitializerResult: any;
let contextValue: any = null;
const setAccentThemeState = mock((_value: any) => {});
const ProviderMock = (_props: any) => null;
const contextObject = { Provider: ProviderMock };
const createContext = mock((_defaultValue: any) => contextObject);
const useContext = mock((_context: any) => contextValue);
const useState = mock((initial: any) => {
  stateInitializerResult = typeof initial === "function" ? initial() : initial;
  return [stateValue ?? stateInitializerResult, setAccentThemeState];
});
const effects: Array<() => void | (() => void)> = [];
const useEffect = mock((effect: () => void | (() => void)) => {
  effects.push(effect);
});
const readAccentTheme = mock((_dataset: any, _storage: any) => "sage" as any);
const persistAccentTheme = mock((_storage: any, _theme: any) => true);

mock.module("react", () => ({
  createContext,
  useContext,
  useState,
  useEffect,
}));
mock.module("@/lib/accent-theme", () => ({
  readAccentTheme,
  persistAccentTheme,
}));

const module = await import("../components/accent-theme-provider");
const { AccentThemeProvider, useAccentTheme, accentThemes } = module;

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const storage = {
  getItem: mock((_key: string) => null),
  setItem: mock((_key: string, _value: string) => {}),
};
let dataset: Record<string, string | undefined> = {};

function installBrowser() {
  globalThis.window = { localStorage: storage } as any;
  globalThis.document = {
    documentElement: { dataset },
  } as any;
}

beforeEach(() => {
  stateValue = "sky";
  stateInitializerResult = undefined;
  contextValue = null;
  dataset = {};
  effects.length = 0;
  useContext.mockClear();
  useState.mockClear();
  useEffect.mockClear();
  setAccentThemeState.mockClear();
  readAccentTheme.mockClear();
  readAccentTheme.mockImplementation(() => "sage");
  persistAccentTheme.mockClear();
  persistAccentTheme.mockImplementation(() => true);
  installBrowser();
});

describe("accent theme catalog", () => {
  test("exposes exactly the supported theme ids", () => {
    expect(accentThemes.map((theme) => theme.id)).toEqual(["sky", "sage", "rose"]);
  });

  test("theme ids are unique", () => {
    const ids = accentThemes.map((theme) => theme.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every theme includes complete light and dark preview colors", () => {
    for (const theme of accentThemes) {
      expect(theme.name.length).toBeGreaterThan(0);
      expect(theme.description.length).toBeGreaterThan(0);
      expect(theme.preview.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.preview.reply).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.preview.replyDark).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("AccentThemeProvider initialization", () => {
  test("creates context with a null default exactly once at module initialization", () => {
    expect(createContext).toHaveBeenCalledTimes(1);
    expect(createContext).toHaveBeenCalledWith(null);
  });

  test("uses sky during server rendering without touching storage", () => {
    delete (globalThis as any).window;
    stateValue = undefined;
    const tree = AccentThemeProvider({ children: "child" });
    expect(stateInitializerResult).toBe("sky");
    expect(readAccentTheme).not.toHaveBeenCalled();
    expect(findOne(tree, (node) => node.type === ProviderMock).props.children).toBe("child");
  });

  test("hydrates from dataset and localStorage through the hardened reader", () => {
    dataset.accentTheme = "rose";
    stateValue = undefined;
    AccentThemeProvider({ children: "child" });
    expect(readAccentTheme).toHaveBeenCalledWith("rose", storage);
    expect(stateInitializerResult).toBe("sage");
  });

  test("provides the current theme and exact state setter to descendants", () => {
    stateValue = "rose";
    const tree = AccentThemeProvider({ children: "child" });
    const provider = findOne(tree, (node) => node.type === ProviderMock);
    expect(provider.props.value).toEqual({
      accentTheme: "rose",
      setAccentTheme: setAccentThemeState,
    });
  });
});

describe("AccentThemeProvider persistence effect", () => {
  test("writes the current theme to the document dataset and storage", () => {
    stateValue = "sage";
    AccentThemeProvider({ children: "child" });
    expect(effects).toHaveLength(1);
    effects[0]();
    expect(dataset.accentTheme).toBe("sage");
    expect(persistAccentTheme).toHaveBeenCalledWith(storage, "sage");
  });

  test("still updates the dataset if persistence helper reports storage failure", () => {
    persistAccentTheme.mockImplementation(() => false);
    stateValue = "rose";
    AccentThemeProvider({ children: "child" });
    expect(() => effects[0]()).not.toThrow();
    expect(dataset.accentTheme).toBe("rose");
  });
});

describe("useAccentTheme", () => {
  test("returns the context value unchanged", () => {
    const value = {
      accentTheme: "sky",
      setAccentTheme: setAccentThemeState,
    };
    contextValue = value;
    expect(useAccentTheme()).toBe(value);
    expect(useContext).toHaveBeenCalledWith(contextObject);
  });

  test("throws a clear usage error outside the provider", () => {
    contextValue = null;
    expect(() => useAccentTheme()).toThrow(
      "useAccentTheme must be used within AccentThemeProvider",
    );
  });
});

process.on("exit", () => {
  globalThis.window = originalWindow;
  globalThis.document = originalDocument;
});
