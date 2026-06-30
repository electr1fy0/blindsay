"use client";

import { useEffect, useState } from "react";

const STORAGE_PREFIX = "blindsay:draft:";

export function usePersistedDraft(storageKey: string, initialValue = "") {
  const key = `${STORAGE_PREFIX}${storageKey}`;
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue !== null) {
        setValue(storedValue);
      }
    } catch {
      // Ignore storage read failures and keep the in-memory draft.
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;

    const timer = setTimeout(() => {
      try {
        if (value.trim()) {
          window.localStorage.setItem(key, value);
        } else {
          window.localStorage.removeItem(key);
        }
      } catch {
        // Ignore storage write failures and keep the in-memory draft.
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [hydrated, key, value]);

  const clearDraft = () => {
    setValue("");

    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage delete failures.
    }
  };

  return {
    value,
    setValue,
    clearDraft,
    hydrated,
  };
}
