"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const STORAGE_PREFIX = "blindsay:draft:";

export function usePersistedDraft(storageKey: string, initialValue = "") {
  const key = `${STORAGE_PREFIX}${storageKey}`;
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const latestValue = useRef(value);
  latestValue.current = value;

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue !== null) {
        setValue(storedValue);
      }
    } catch {
    } finally {
      setHydrated(true);
    }
  }, [key]);

  const persist = useCallback(() => {
    try {
      if (latestValue.current.trim()) {
        window.localStorage.setItem(key, latestValue.current);
      } else {
        window.localStorage.removeItem(key);
      }
    } catch {
    }
  }, [key]);

  useEffect(() => {
    window.addEventListener("beforeunload", persist);
    window.addEventListener("pagehide", persist);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) persist();
    });
    const interval = setInterval(persist, 30000);
    return () => {
      window.removeEventListener("beforeunload", persist);
      window.removeEventListener("pagehide", persist);
      clearInterval(interval);
    };
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
