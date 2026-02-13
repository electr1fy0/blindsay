"use client";

import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification03Icon,
  UserSettings01Icon,
  ViewIcon,
  Analytics01Icon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";
import { MobileNav } from "@/components/mobile-nav";
import { SignOutButton } from "@/components/sign-out-button";
import { usePathname } from "next/navigation";

type AppShellProps = {
  children: React.ReactNode;
  username?: string | null;
  isOwner?: boolean;
};

export function AppShell({ children, username, isOwner }: AppShellProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen">
      <aside className="fixed left-4 top-4 hidden h-[calc(100vh-2rem)] w-60 md:flex">
        <div className="panel-card flex h-full w-full flex-col gap-4 px-4 py-6">
          <div className="flex items-center gap-3">
            <Image
              src="/unsaid.png"
              alt="Unsaid logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <div className="text-base font-normal tracking-[0.06em]">UNSAID</div>
          </div>
          <nav className="flex flex-1 flex-col gap-2 text-sm">
            {username ? (
              <Link
                href={`/${username}`}
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  }),
                  isActive(`/${username}`) ? "nav-pill-active" : "nav-pill",
                  "rounded-2xl justify-start gap-2",
                )}
              >
                <HugeiconsIcon
                  icon={Notification03Icon}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Inbox
              </Link>
            ) : null}
            {isOwner ? (
              <Link
              href="/published"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                isActive("/published") ? "nav-pill-active" : "nav-pill",
                "rounded-2xl justify-start gap-2",
                )}
              >
                <HugeiconsIcon
                  icon={ViewIcon}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Published
              </Link>
            ) : null}
            {isOwner ? (
              <Link
              href="/analytics"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                isActive("/analytics") ? "nav-pill-active" : "nav-pill",
                "rounded-2xl justify-start gap-2",
                )}
              >
                <HugeiconsIcon
                  icon={Analytics01Icon}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Analytics
              </Link>
            ) : null}
            {isOwner ? (
              <Link
              href="/account"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                isActive("/account") ? "nav-pill-active" : "nav-pill",
                "rounded-2xl justify-start gap-2",
                )}
              >
                <HugeiconsIcon
                  icon={UserSettings01Icon}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Account
              </Link>
            ) : null}
            {isOwner ? (
              <Link
              href="/help"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                isActive("/help") ? "nav-pill-active" : "nav-pill",
                "rounded-2xl justify-start gap-2",
                )}
              >
                <HugeiconsIcon
                  icon={HelpCircleIcon}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Help
              </Link>
            ) : null}
          </nav>
          {isOwner ? (
            <div className="pt-2">
              <SignOutButton size="sm" className="w-full justify-center" />
            </div>
          ) : null}
        </div>
      </aside>
      <div className="mx-auto flex max-w-6xl gap-6 px-5 py-8 md:pl-[18rem]">
        <main className="min-w-0 flex-1">
          <MobileNav username={username} isOwner={isOwner} />
          <div className="mt-4 md:mt-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
