export type ShellTheme = "light" | "dark" | "system";
export type SettingsTab = "account" | "support" | "appearance";

const THEME_CYCLE: Record<ShellTheme, ShellTheme> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const THEME_LABELS: Record<ShellTheme, string> = {
  light: "Light theme",
  dark: "Dark theme",
  system: "System theme",
};

export function normalizeShellTheme(theme?: string | null): ShellTheme {
  return theme === "light" || theme === "dark" || theme === "system"
    ? theme
    : "system";
}

export function getNextShellTheme(theme?: string | null): ShellTheme {
  return THEME_CYCLE[normalizeShellTheme(theme)];
}

export function getShellThemeLabel(theme?: string | null): string {
  return THEME_LABELS[normalizeShellTheme(theme)];
}

export function getViewedUsername(params: unknown): string | undefined {
  if (!params || typeof params !== "object") return undefined;
  const username = (params as { username?: unknown }).username;
  return typeof username === "string" ? username : undefined;
}

export function isOwnerShellView(
  viewedUsername: string | undefined,
  userUsername?: string | null,
): boolean {
  if (!userUsername) return false;
  if (!viewedUsername) return true;
  return viewedUsername.toLowerCase() === userUsername.toLowerCase();
}

export function resolveShellUsername(
  viewedUsername: string | undefined,
  userUsername?: string | null,
): string | null | undefined {
  return viewedUsername ?? userUsername;
}

export function getSettingsState(
  pathname: string,
  isOpenManual: boolean,
): { isOpen: boolean; tab: SettingsTab } {
  if (pathname === "/help") {
    return { isOpen: true, tab: "support" };
  }
  if (pathname === "/account") {
    return { isOpen: true, tab: "account" };
  }
  return { isOpen: isOpenManual, tab: "appearance" };
}

export function getSettingsClosePath(
  pathname: string,
  username?: string | null,
): string | null {
  if (pathname !== "/account" && pathname !== "/help") return null;
  return username ? `/${username}` : "/";
}
