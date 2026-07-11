"use client";

import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import { LaptopIcon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const nextTheme: Record<string, string> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const labels: Record<string, string> = {
  light: "Switch to dark mode",
  dark: "Use system setting",
  system: "Switch to light mode",
};

const icons: Record<string, typeof Sun03Icon> = {
  light: Moon02Icon,
  dark: LaptopIcon,
  system: Sun03Icon,
};

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const current = theme ?? "system";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme[current])}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer",
        className,
      )}
      title={labels[current]}
      aria-label={labels[current]}
    >
      <HugeiconsIcon
        icon={icons[current]}
        size={17}
        strokeWidth={1.7}
      />
    </button>
  );
}
