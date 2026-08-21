"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  persistDraftValue,
  readDraft,
  subscribeDraftPersistence,
} from "@/lib/draft-persistence";

const STORAGE_PREFIX = "blindsay:draft:";

export function usePersistedDraft(storageKey: string, initialValue = "") {
  const key = `${STORAGE_PREFIX}${storageKey}`;
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const latestValue = useRef(value);
  latestValue.current = value;

  useEffect(() => {
    const storedValue = readDraft(window.localStorage, key);
    if (storedValue !== null) {
      setValue(storedValue);
    }
    setHydrated(true);
  }, [key]);

  const persist = useCallback(() => {
    persistDraftValue(window.localStorage, key, latestValue.current);
  }, [key]);

  useEffect(() => {
    return subscribeDraftPersistence(window, document, persist);
  }, [persist]);

  const clearDraft = () => {
    setValue("");
    try {
      window.localStorage.removeItem(key);
    } catch {
    }
  };

  return {
    value,
    setValue,
    clearDraft,
    persist,
    hydrated,
  };
}
