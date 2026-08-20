"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  persistAccentTheme,
  readAccentTheme,
  type AccentTheme,
} from "@/lib/accent-theme";

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

export type { AccentTheme };

type AccentThemeContextValue = {
  accentTheme: AccentTheme;
  setAccentTheme: (theme: AccentTheme) => void;
};

const AccentThemeContext = createContext<AccentThemeContextValue | null>(null);

export function AccentThemeProvider({ children }: { children: ReactNode }) {
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>(() => {
    if (typeof window === "undefined") {
      return "sky";
    }

    return readAccentTheme(
      document.documentElement.dataset.accentTheme,
      window.localStorage,
    );
  });

  useEffect(() => {
    document.documentElement.dataset.accentTheme = accentTheme;
    persistAccentTheme(window.localStorage, accentTheme);
  }, [accentTheme]);

  const value = {
    accentTheme,
    setAccentTheme: setAccentThemeState,
  };

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
