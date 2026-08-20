export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type WindowLike = Pick<
  Window,
  "addEventListener" | "removeEventListener" | "setInterval" | "clearInterval"
>;

type DocumentLike = Pick<
  Document,
  "addEventListener" | "removeEventListener" | "hidden"
>;

export function readDraft(storage: StorageLike, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function persistDraftValue(
  storage: StorageLike,
  key: string,
  value: string,
): boolean {
  try {
    if (value.trim()) {
      storage.setItem(key, value);
    } else {
      storage.removeItem(key);
    }
    return true;
  } catch {
    return false;
  }
}

export function subscribeDraftPersistence(
  win: WindowLike,
  doc: DocumentLike,
  persist: () => void,
  intervalMs = 30_000,
) {
  const handleVisibilityChange = () => {
    if (doc.hidden) persist();
  };

  win.addEventListener("beforeunload", persist);
  win.addEventListener("pagehide", persist);
  doc.addEventListener("visibilitychange", handleVisibilityChange);
  const interval = win.setInterval(persist, intervalMs);

  return () => {
    win.removeEventListener("beforeunload", persist);
    win.removeEventListener("pagehide", persist);
    doc.removeEventListener("visibilitychange", handleVisibilityChange);
    win.clearInterval(interval);
  };
}
