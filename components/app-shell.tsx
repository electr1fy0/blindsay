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
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { usePathname, useParams, useRouter } from "next/navigation";
import { SettingsDialog } from "@/components/settings-dialog";
import { useTheme } from "next-themes";

type AppShellProps = {
  children: React.ReactNode;
  user?: {
    username?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

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
  const settingsTab = pathname === "/help" ? "support" : "account";

  const handleCloseSettings = () => {
    setIsOpenManual(false);
    if (pathname === "/account" || pathname === "/help") {
      router.push(`/${username || ""}`);
    }
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] overflow-hidden flex flex-col bg-body-bg relative">
      {/* Dynamic Glassmorphic Background Glow Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-primary/6 blur-[80px] dark:bg-primary/4 pointer-events-none" style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden' }} />
        <div className="absolute -bottom-[15%] -right-[10%] w-[65%] h-[65%] rounded-full bg-primary/5 blur-[100px] dark:bg-primary/3 pointer-events-none" style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden' }} />
      </div>

      {isOwner ? (
        <>
          {/* Top Navbar */}
          <header 
            className="sticky top-0 z-40 w-full bg-body-bg shrink-0 z-10"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="w-full flex h-12 items-center justify-between gap-4 px-6 z-10">
              {/* Navigation Elements */}
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
                    isActive(`/${username}`)
                      ? "nav-pill-active"
                      : buttonVariants({ variant: "ghost", size: "xs" }),
                    isActive(`/${username}`) ? "" : "nav-pill",
                      isActive(`/${username}`) ? "rounded-[7px]" : "rounded-[5px]",
                      "gap-1 px-2 py-1 text-xs font-normal tracking-[0.02em] h-7.5 inline-flex items-center sm:gap-1.5 sm:px-2.5 sm:text-sm sm:tracking-[0.03em]",
                    )}
                  >
                    <HugeiconsIcon
                      icon={Notification03Icon}
                      size={14}
                      strokeWidth={1.45}
                    />
                    <span>Inbox</span>
                  </Link>
                ) : null}

                <Link
                  href="/analytics"
                  className={cn(
                    isActive("/analytics")
                      ? "nav-pill-active"
                      : buttonVariants({ variant: "ghost", size: "xs" }),
                    isActive("/analytics") ? "" : "nav-pill",
                    isActive("/analytics") ? "rounded-[7px]" : "rounded-[5px]",
                    "gap-1 px-2 py-1 text-xs font-normal tracking-[0.02em] h-7.5 inline-flex items-center sm:gap-1.5 sm:px-2.5 sm:text-sm sm:tracking-[0.03em]",
                  )}
                >
                  <HugeiconsIcon
                    icon={Analytics01Icon}
                    size={14}
                    strokeWidth={1.45}
                  />
                  <span>Analytics</span>
                </Link>

                <Link
                  href="/share"
                  className={cn(
                    isActive("/share")
                      ? "nav-pill-active"
                      : buttonVariants({ variant: "ghost", size: "xs" }),
                    isActive("/share") ? "" : "nav-pill",
                    isActive("/share") ? "rounded-[7px]" : "rounded-[5px]",
                    "gap-1 px-2 py-1 text-xs font-normal tracking-[0.02em] h-7.5 inline-flex items-center sm:gap-1.5 sm:px-2.5 sm:text-sm sm:tracking-[0.03em]",
                  )}
                >
                  <HugeiconsIcon
                    icon={Link01Icon}
                    size={14}
                    strokeWidth={1.45}
                  />
                  <span>Share</span>
                </Link>
              </nav>

              <button
                type="button"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
                title={
                  resolvedTheme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                aria-label={
                  resolvedTheme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                <HugeiconsIcon
                  icon={resolvedTheme === "dark" ? Sun03Icon : Moon02Icon}
                  size={17}
                  strokeWidth={1.7}
                />
              </button>
            </div>
          </header>

          {/* Main Layout Area - Floating curved sheet above navbar */}
          <div className="w-full flex-1 overflow-hidden px-2 sm:px-3 pb-0 z-10">
            <div className="bg-background/80 backdrop-blur-md rounded-t-[1.25rem] border-t border-x border-border/70 shadow-xs h-full flex flex-col overflow-hidden">
              <div className="shell-scrollbar flex-1 overflow-y-auto px-6 sm:px-8 pt-8 pb-32">
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
        <div className="w-full flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-lg flex-col gap-6 px-[19px] py-8 pb-24">
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
