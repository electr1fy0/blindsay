"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { RESERVED_USERNAMES } from "@/lib/constants";
import {
  getNextShellTheme,
  getSettingsClosePath,
  getSettingsState,
  getShellThemeLabel,
  getViewedUsername,
  isOwnerShellView,
  normalizeShellTheme,
  resolveShellUsername,
  type ShellTheme,
} from "@/lib/app-shell-state";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification03Icon,
  Analytics01Icon,
  LaptopIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { usePathname, useParams, useRouter } from "next/navigation";
import { SettingsDialog } from "@/components/settings-dialog";
import { useTheme } from "next-themes";
import { motion, LayoutGroup } from "motion/react";

type AppShellProps = {
  children: React.ReactNode;
  user?: {
    username?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
};

const icons: Record<ShellTheme, typeof Sun03Icon> = {
  light: Moon02Icon,
  dark: LaptopIcon,
  system: Sun03Icon,
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const viewedUsername = getViewedUsername(params);
  const isOwner = isOwnerShellView(viewedUsername, user?.username);
  const username = resolveShellUsername(viewedUsername, user?.username);
  const shellTheme = normalizeShellTheme(theme);

  const isActive = (href: string) => pathname === href;

  const [isOpenManual, setIsOpenManual] = useState(false);
  const settings = getSettingsState(pathname, isOpenManual);

  const handleCloseSettings = () => {
    setIsOpenManual(false);
    const closePath = getSettingsClosePath(pathname, username);
    if (closePath) {
      router.push(closePath);
    }
  };

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-body-bg relative">
      {isOwner ? (
        <>
          <header
            className="sticky top-0 z-40 shrink-0 px-2 sm:px-3"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="mx-auto max-w-2xl flex h-12 items-center justify-between gap-4 px-6 bg-background/80 backdrop-blur-md rounded-b-[1.25rem] border-b border-x border-border/70 shadow-xs">
              <LayoutGroup>
                <nav className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    onClick={() => setIsOpenManual(true)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer mr-2 overflow-hidden"
                    title="Account Settings"
                  >
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={username ?? "Profile"}
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[0.65rem] font-bold text-foreground">
                        {(username ?? user?.email ?? "U")
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>
                    )}
                  </button>

                  {username ? (
                    <Link
                      href={`/${username}`}
                      className={cn(
                        "relative inline-flex items-center gap-1 px-2 py-1 text-xs font-normal tracking-[0.02em] h-7.5 rounded-[5px] sm:gap-1.5 sm:px-2.5 sm:text-sm sm:tracking-[0.03em]",
                        isActive(`/${username}`)
                          ? "text-foreground font-medium"
                          : "text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {isActive(`/${username}`) && (
                        <motion.div
                          layoutId="active-tab"
                          className="absolute inset-0 bg-foreground/[0.13] rounded-[7px]"
                          transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.8 }}
                        />
                      )}
                      <span className="relative z-10 inline-flex items-center gap-1 sm:gap-1.5">
                        <HugeiconsIcon
                          icon={Notification03Icon}
                          size={14}
                          strokeWidth={1.45}
                        />
                        <span>Inbox</span>
                      </span>
                    </Link>
                  ) : null}

                  <Link
                    href="/analytics"
                    className={cn(
                      "relative inline-flex items-center gap-1 px-2 py-1 text-xs font-normal tracking-[0.02em] h-7.5 rounded-[5px] sm:gap-1.5 sm:px-2.5 sm:text-sm sm:tracking-[0.03em]",
                      isActive("/analytics")
                        ? "text-foreground font-medium"
                        : "text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {isActive("/analytics") && (
                      <motion.div
                        layoutId="active-tab"
                        className="absolute inset-0 bg-foreground/[0.13] rounded-[7px]"
                        transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-1 sm:gap-1.5">
                      <HugeiconsIcon
                        icon={Analytics01Icon}
                        size={14}
                        strokeWidth={1.45}
                      />
                      <span>Analytics</span>
                    </span>
                  </Link>
                </nav>
              </LayoutGroup>

              <button
                type="button"
                onClick={() => setTheme(getNextShellTheme(theme))}
                className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
                title={getShellThemeLabel(theme)}
                aria-label={getShellThemeLabel(theme)}
              >
                <HugeiconsIcon
                  icon={icons[shellTheme]}
                  size={17}
                  strokeWidth={1.7}
                />
              </button>
            </div>
          </header>

          <div className="shell-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-8 pt-8 pb-32">
            <main className="min-w-0">
              {username &&
              RESERVED_USERNAMES.includes(username.toLowerCase()) ? (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                  <div className="flex items-center gap-3">
                    <HugeiconsIcon
                      icon={Notification03Icon}
                      size={20}
                      className="shrink-0"
                    />
                    <p className="text-sm font-medium">
                      Your username is reserved. Please trigger Settings to
                      change it.
                    </p>
                  </div>
                </div>
              ) : null}
              {children}
            </main>
          </div>

          <SettingsDialog
            isOpen={settings.isOpen}
            onClose={handleCloseSettings}
            initialTab={settings.tab}
          />
        </>
      ) : (
        <div className="w-full flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto flex max-w-xl flex-col gap-6 px-3 sm:px-[19px] py-8 pb-24">
            <header className="flex items-center justify-center gap-2 py-2">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/blindsay.png"
                  alt="BLINDSAY logo"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
                <span className="text-sm font-normal tracking-[0.06em]">
                  BLINDSAY
                </span>
              </Link>
            </header>
            <main className="min-w-0">{children}</main>
          </div>
        </div>
      )}
    </div>
  );
}
