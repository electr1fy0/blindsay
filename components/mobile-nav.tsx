"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Menu01Icon,
  Notification03Icon,
  UserSettings01Icon,
  ViewIcon,
  Analytics01Icon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { usePathname } from "next/navigation";

type MobileNavProps = {
  username?: string | null;
  isOwner?: boolean;
};

export function MobileNav({ username, isOwner }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between panel-card px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/unsaid.png"
            alt="Unsaid logo"
            width={26}
            height={26}
            className="rounded-md"
          />
          <span className="text-sm font-semibold tracking-[0.06em]">
            Unsaid
          </span>
        </Link>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <HugeiconsIcon
            icon={Menu01Icon}
            size={18}
            color="currentColor"
            strokeWidth={1.5}
          />
        </Button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-4 top-6 w-56 max-w-[calc(100vw-1.5rem)] panel-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Navigation
              </span>
              <Button variant="ghost" size="xs" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {username ? (
                <Link
                  href={`/${username}`}
                  onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
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
              {isOwner ? (
                <SignOutButton size="sm" className="w-full justify-center" />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
