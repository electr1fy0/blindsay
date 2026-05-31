"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const accentThemes = [
  {
    id: "sky",
    name: "Sky",
    description: "Current bright blue accents.",
    preview: {
      accent: "#00b9ff",
      reply: "#dff2ff",
      replyDark: "#155e8a",
    },
  },
  {
    id: "sage",
    name: "Sage",
    description: "Soft green accents with more grounded replies.",
    preview: {
      accent: "#4e9f73",
      reply: "#dbeee2",
      replyDark: "#1f372b",
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Warm coral accents with clearer reply bubbles.",
    preview: {
      accent: "#e56b6f",
      reply: "#f8dfe1",
      replyDark: "#47262b",
    },
  },
] as const;

export type AccentTheme = (typeof accentThemes)[number]["id"];

const STORAGE_KEY = "blindsay-accent-theme";

type AccentThemeContextValue = {
  accentTheme: AccentTheme;
  setAccentTheme: (theme: AccentTheme) => void;
};

const AccentThemeContext = createContext<AccentThemeContextValue | null>(null);

function isAccentTheme(value: string): value is AccentTheme {
  return accentThemes.some((theme) => theme.id === value);
}

export function AccentThemeProvider({ children }: { children: ReactNode }) {
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>(() => {
    if (typeof window === "undefined") {
      return "sky";
    }

    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    return storedTheme && isAccentTheme(storedTheme) ? storedTheme : "sky";
  });

  useEffect(() => {
    document.documentElement.dataset.accentTheme = accentTheme;
    window.localStorage.setItem(STORAGE_KEY, accentTheme);
  }, [accentTheme]);

  const value = useMemo(
    () => ({
      accentTheme,
      setAccentTheme: setAccentThemeState,
    }),
    [accentTheme],
  );

  return (
    <AccentThemeContext.Provider value={value}>
      {children}
    </AccentThemeContext.Provider>
  );
}

export function useAccentTheme() {
  const context = useContext(AccentThemeContext);

  if (!context) {
    throw new Error("useAccentTheme must be used within AccentThemeProvider");
  }

  return context;
}
