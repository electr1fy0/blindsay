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
} from "@hugeicons/core-free-icons";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type MobileNavProps = {
  username?: string | null;
  isOwner?: boolean;
};

export function MobileNav({ username, isOwner }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between rounded-3xl border border-foreground/10 bg-card/90 px-4 py-3">
        <div className="flex items-center gap-2">
          <Image
            src="/unsaid.png"
            alt="Unsaid logo"
            width={26}
            height={26}
            className="border border-foreground/15"
          />
          <span className="text-sm font-semibold tracking-[0.06em]">
            Unsaid
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <HugeiconsIcon icon={Menu01Icon} size={18} color="currentColor" strokeWidth={1.5} />
        </Button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-4 top-4 w-[260px] rounded-3xl border border-foreground/10 bg-card/95 p-4">
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
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-2xl justify-start gap-2"
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
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-2xl justify-start gap-2"
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
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-2xl justify-start gap-2"
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
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-2xl justify-start gap-2"
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
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
