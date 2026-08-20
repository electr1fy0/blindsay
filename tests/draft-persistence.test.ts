import { describe, expect, mock, test } from "bun:test";
import {
  persistDraftValue,
  readDraft,
  subscribeDraftPersistence,
} from "../lib/draft-persistence";

function storage(overrides: Partial<Storage> = {}) {
  return {
    getItem: mock((_key: string) => null as string | null),
    setItem: mock((_key: string, _value: string) => {}),
    removeItem: mock((_key: string) => {}),
    ...overrides,
  } as Pick<Storage, "getItem" | "setItem" | "removeItem">;
}

describe("readDraft", () => {
  test("returns a stored draft verbatim", () => {
    const store = storage({ getItem: mock(() => "  unfinished draft  ") as any });
    expect(readDraft(store, "draft-key")).toBe("  unfinished draft  ");
  });

  test("returns null when there is no draft", () => {
    expect(readDraft(storage(), "missing")).toBeNull();
  });

  test("fails closed when storage access throws", () => {
    const store = storage({
      getItem: mock(() => {
        throw new Error("blocked storage");
      }) as any,
    });
    expect(readDraft(store, "draft-key")).toBeNull();
  });
});

describe("persistDraftValue", () => {
  test("stores non-empty content without trimming it", () => {
    const store = storage();
    expect(persistDraftValue(store, "draft-key", "  text  ")).toBe(true);
    expect(store.setItem).toHaveBeenCalledWith("draft-key", "  text  ");
    expect(store.removeItem).not.toHaveBeenCalled();
  });

  test.each(["", " ", "\n\t "])("removes blank content %#", (value) => {
    const store = storage();
    expect(persistDraftValue(store, "draft-key", value)).toBe(true);
    expect(store.removeItem).toHaveBeenCalledWith("draft-key");
    expect(store.setItem).not.toHaveBeenCalled();
  });

  test("reports failure when setItem throws", () => {
    const store = storage({
      setItem: mock(() => {
        throw new Error("quota exceeded");
      }) as any,
    });
    expect(persistDraftValue(store, "draft-key", "text")).toBe(false);
  });

  test("reports failure when removeItem throws", () => {
    const store = storage({
      removeItem: mock(() => {
        throw new Error("storage unavailable");
      }) as any,
    });
    expect(persistDraftValue(store, "draft-key", " ")).toBe(false);
  });
});

describe("subscribeDraftPersistence", () => {
  test("subscribes to unload, pagehide, visibility, and periodic persistence", () => {
    const persist = mock(() => {});
    const addWindow = mock((_event: string, _handler: any) => {});
    const removeWindow = mock((_event: string, _handler: any) => {});
    const addDocument = mock((_event: string, _handler: any) => {});
    const removeDocument = mock((_event: string, _handler: any) => {});
    const setIntervalMock = mock((_handler: any, _ms: number) => 77 as any);
    const clearIntervalMock = mock((_id: any) => {});
    const win = {
      addEventListener: addWindow,
      removeEventListener: removeWindow,
      setInterval: setIntervalMock,
      clearInterval: clearIntervalMock,
    } as any;
    const doc = {
      hidden: false,
      addEventListener: addDocument,
      removeEventListener: removeDocument,
    } as any;

    const cleanup = subscribeDraftPersistence(win, doc, persist, 12_345);

    expect(addWindow).toHaveBeenCalledWith("beforeunload", persist);
    expect(addWindow).toHaveBeenCalledWith("pagehide", persist);
    expect(addDocument).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(setIntervalMock).toHaveBeenCalledWith(persist, 12_345);

    cleanup();

    expect(removeWindow).toHaveBeenCalledWith("beforeunload", persist);
    expect(removeWindow).toHaveBeenCalledWith("pagehide", persist);
    expect(removeDocument).toHaveBeenCalledWith("visibilitychange", addDocument.mock.calls[0][1]);
    expect(clearIntervalMock).toHaveBeenCalledWith(77);
  });

  test("persists only when visibility changes to hidden", () => {
    const persist = mock(() => {});
    let visibilityHandler: (() => void) | undefined;
    const doc = {
      hidden: false,
      addEventListener: mock((event: string, handler: () => void) => {
        if (event === "visibilitychange") visibilityHandler = handler;
      }),
      removeEventListener: mock(() => {}),
    } as any;
    const win = {
      addEventListener: mock(() => {}),
      removeEventListener: mock(() => {}),
      setInterval: mock(() => 1 as any),
      clearInterval: mock(() => {}),
    } as any;

    subscribeDraftPersistence(win, doc, persist);
    visibilityHandler?.();
    expect(persist).not.toHaveBeenCalled();

    doc.hidden = true;
    visibilityHandler?.();
    expect(persist).toHaveBeenCalledTimes(1);
  });
});
