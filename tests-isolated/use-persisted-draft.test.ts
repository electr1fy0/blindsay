import { beforeEach, describe, expect, mock, test } from "bun:test";

let valueState = "";
let hydratedState = false;
let stateIndex = 0;
let refObject = { current: "" };
const setValue = mock((_value: string) => {});
const setHydrated = mock((_value: boolean) => {});
const useState = mock((initial: any) => {
  const index = stateIndex++;
  if (index === 0) {
    if (valueState === "__USE_INITIAL__") valueState = initial;
    return [valueState, setValue];
  }
  return [hydratedState, setHydrated];
});
const useRef = mock((_initial: any) => refObject);
const callbacks: Array<() => void> = [];
const useCallback = mock((callback: () => void, _deps: any[]) => {
  callbacks.push(callback);
  return callback;
});
const effects: Array<() => void | (() => void)> = [];
const useEffect = mock((effect: () => void | (() => void), _deps?: any[]) => {
  effects.push(effect);
});
const readDraft = mock((_storage: any, _key: string) => null as string | null);
const persistDraftValue = mock((_storage: any, _key: string, _value: string) => true);
const cleanupPersistence = mock(() => {});
const subscribeDraftPersistence = mock(
  (_window: any, _document: any, _persist: () => void) => cleanupPersistence,
);

mock.module("react", () => ({
  useState,
  useRef,
  useCallback,
  useEffect,
}));
mock.module("@/lib/draft-persistence", () => ({
  readDraft,
  persistDraftValue,
  subscribeDraftPersistence,
}));

const { usePersistedDraft } = await import("../lib/use-persisted-draft");

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const removeItem = mock((_key: string) => {});
const localStorage = { removeItem };
const windowObject = { localStorage };
const documentObject = { hidden: false };

function render(key = "anonymous:u1:alice", initialValue = "") {
  stateIndex = 0;
  callbacks.length = 0;
  effects.length = 0;
  return usePersistedDraft(key, initialValue);
}

beforeEach(() => {
  valueState = "";
  hydratedState = false;
  stateIndex = 0;
  refObject = { current: "" };
  callbacks.length = 0;
  effects.length = 0;
  setValue.mockClear();
  setHydrated.mockClear();
  useState.mockClear();
  useRef.mockClear();
  useCallback.mockClear();
  useEffect.mockClear();
  readDraft.mockClear();
  readDraft.mockImplementation(() => null);
  persistDraftValue.mockClear();
  persistDraftValue.mockImplementation(() => true);
  subscribeDraftPersistence.mockClear();
  subscribeDraftPersistence.mockImplementation(() => cleanupPersistence);
  cleanupPersistence.mockClear();
  removeItem.mockClear();
  globalThis.window = windowObject as any;
  globalThis.document = documentObject as any;
});

describe("usePersistedDraft state", () => {
  test("uses the provided initial value before hydration", () => {
    valueState = "__USE_INITIAL__";
    const result = render("message", "initial draft");
    expect(result.value).toBe("initial draft");
    expect(result.hydrated).toBe(false);
  });

  test("returns exact state setter and stable public methods", () => {
    valueState = "draft";
    const result = render();
    expect(result.setValue).toBe(setValue);
    expect(result.clearDraft).toBeFunction();
    expect(result.persist).toBeFunction();
  });

  test("tracks the latest rendered value in the ref on every render", () => {
    valueState = "latest draft";
    render();
    expect(refObject.current).toBe("latest draft");
  });
});

describe("hydration effect", () => {
  test("reads the fully-prefixed storage key", () => {
    render("reply:owner:alice:parent");
    effects[0]();
    expect(readDraft).toHaveBeenCalledWith(
      localStorage,
      "blindsay:draft:reply:owner:alice:parent",
    );
  });

  test("installs a stored value verbatim when present", () => {
    readDraft.mockImplementation(() => "  persisted text  ");
    render();
    effects[0]();
    expect(setValue).toHaveBeenCalledWith("  persisted text  ");
    expect(setHydrated).toHaveBeenCalledWith(true);
  });

  test("does not overwrite state when storage has no draft", () => {
    readDraft.mockImplementation(() => null);
    render();
    effects[0]();
    expect(setValue).not.toHaveBeenCalled();
    expect(setHydrated).toHaveBeenCalledWith(true);
  });

  test("always marks hydration complete after the read", () => {
    render();
    effects[0]();
    expect(setHydrated).toHaveBeenCalledTimes(1);
    expect(setHydrated).toHaveBeenCalledWith(true);
  });
});

describe("persist callback", () => {
  test("persists the latest ref value rather than a stale render closure", () => {
    valueState = "rendered";
    const result = render("message");
    refObject.current = "newest typed value";
    result.persist();
    expect(persistDraftValue).toHaveBeenCalledWith(
      localStorage,
      "blindsay:draft:message",
      "newest typed value",
    );
  });

  test("passes persist callback into browser lifecycle subscription", () => {
    const result = render("message");
    const cleanup = effects[1]();
    expect(subscribeDraftPersistence).toHaveBeenCalledWith(
      windowObject,
      documentObject,
      result.persist,
    );
    expect(cleanup).toBe(cleanupPersistence);
  });
});

describe("clearDraft", () => {
  test("clears state and removes the exact storage key", () => {
    const result = render("message");
    result.clearDraft();
    expect(setValue).toHaveBeenCalledWith("");
    expect(removeItem).toHaveBeenCalledWith("blindsay:draft:message");
  });

  test("still clears React state when localStorage removal throws", () => {
    removeItem.mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    const result = render("message");
    expect(() => result.clearDraft()).not.toThrow();
    expect(setValue).toHaveBeenCalledWith("");
  });
});

process.on("exit", () => {
  globalThis.window = originalWindow;
  globalThis.document = originalDocument;
});
