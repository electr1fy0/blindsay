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
    description: "Classic bright sky blue accents.",
    preview: {
      accent: "#00b9ff",
      reply: "#dff2ff",
      replyDark: "#1075ab",
    },
  },
  {
    id: "sage",
    name: "Sage",
    description: "Calm organic sage green accents.",
    preview: {
      accent: "#4e9f73",
      reply: "#dbeee2",
      replyDark: "#1d5c3d",
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Warm elegant coral rose accents.",
    preview: {
      accent: "#e56b6f",
      reply: "#f8dfe1",
      replyDark: "#802e3a",
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

    const existing = document.documentElement.dataset.accentTheme;
    if (existing && isAccentTheme(existing)) return existing;

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
