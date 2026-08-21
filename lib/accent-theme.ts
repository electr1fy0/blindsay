export const ACCENT_THEME_IDS = ["sky", "sage", "rose"] as const;
export type AccentTheme = (typeof ACCENT_THEME_IDS)[number];

export function isAccentTheme(value: unknown): value is AccentTheme {
  return (
    typeof value === "string" &&
    (ACCENT_THEME_IDS as readonly string[]).includes(value)
  );
}

export function readAccentTheme(
  datasetTheme: string | undefined,
  storage: Pick<Storage, "getItem">,
): AccentTheme {
  if (datasetTheme && isAccentTheme(datasetTheme)) return datasetTheme;

  try {
    const storedTheme = storage.getItem("blindsay-accent-theme");
    return isAccentTheme(storedTheme) ? storedTheme : "sky";
  } catch {
    return "sky";
  }
}

export function persistAccentTheme(
  storage: Pick<Storage, "setItem">,
  theme: AccentTheme,
): boolean {
  try {
    storage.setItem("blindsay-accent-theme", theme);
    return true;
  } catch {
    return false;
  }
}
