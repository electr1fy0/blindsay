"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { RESERVED_USERNAMES } from "@/lib/constants";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification03Icon,
  Analytics01Icon,
  Link01Icon,
  LaptopIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { usePathname, useParams, useRouter } from "next/navigation";
import { SettingsDialog } from "@/components/settings-dialog";
import { MobileNav } from "@/components/mobile-nav";
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

const nextTheme: Record<string, string> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const labels: Record<string, string> = {
  light: "Switch to dark mode",
  dark: "Switch to system theme",
  system: "Switch to light mode",
};

const icons: Record<string, typeof Sun03Icon> = {
  light: Moon02Icon,
  dark: LaptopIcon,
  system: Sun03Icon,
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const viewedUsername =
    typeof params?.username === "string" ? params.username : undefined;

  const isOwner =
    (!viewedUsername && !!user?.username) ||
    (!!viewedUsername &&
      !!user?.username &&
      viewedUsername.toLowerCase() === user.username.toLowerCase());

  const username = viewedUsername ?? user?.username;

  const isActive = (href: string) => pathname === href;

  // Settings Dialog control state
  const [isOpenManual, setIsOpenManual] = useState(false);

  // Deep linking logic for /account or /help pages opening settings automatically
  const isSettingsOpen =
    isOpenManual || pathname === "/account" || pathname === "/help";
  const settingsTab =
    pathname === "/help"
      ? "support"
      : pathname === "/account"
        ? "account"
        : "appearance";

  const handleCloseSettings = () => {
    setIsOpenManual(false);
    if (pathname === "/account" || pathname === "/help") {
      router.push(`/${username || ""}`);
    }
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] overflow-hidden flex flex-col bg-body-bg relative">


      {isOwner ? (
        <>
          {/* Mobile Nav */}
          <MobileNav username={username} isOwner={isOwner} />

          {/* Top Navbar */}
          <header 
            className="sticky top-0 z-40 w-full bg-body-bg shrink-0 z-10"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="w-full flex h-12 items-center justify-between gap-4 px-6 z-10">
              {/* Navigation Elements */}
              <LayoutGroup>
                <nav className="flex items-center gap-1 sm:gap-1.5">
                  {/* Account Settings Avatar Button */}
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
                onClick={() => setTheme(nextTheme[theme ?? "system"])}
                className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
                title={labels[theme ?? "system"]}
                aria-label={labels[theme ?? "system"]}
              >
                <HugeiconsIcon
                  icon={icons[theme ?? "system"]}
                  size={17}
                  strokeWidth={1.7}
                />
              </button>
            </div>
          </header>

          {/* Main Layout Area - Floating curved sheet above navbar */}
          <div className="w-full flex-1 overflow-hidden px-2 sm:px-3 pb-0 z-10">
            <div className="bg-background/80 backdrop-blur-md rounded-t-[1.25rem] border-t border-x border-border/70 shadow-xs h-full flex flex-col overflow-hidden">
              <div className="shell-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-8 pt-8 pb-32">
                <main className="min-w-0 flex-1">
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
            </div>
          </div>

          {/* Account Settings Dialog Modal */}
          <SettingsDialog
            isOpen={isSettingsOpen}
            onClose={handleCloseSettings}
            initialTab={settingsTab}
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
