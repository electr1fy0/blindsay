import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification03Icon,
  UserSettings01Icon,
} from "@hugeicons/core-free-icons";
import { MobileNav } from "@/components/mobile-nav";

type AppShellProps = {
  children: React.ReactNode;
  username?: string | null;
  isOwner?: boolean;
};

export function AppShell({ children, username, isOwner }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 hidden h-screen w-60 flex-col gap-4 border-r border-foreground/10 bg-card/90 px-4 py-6 md:flex">
        <div className="flex items-center gap-3">
          <Image
            src="/unsaid.png"
            alt="Unsaid logo"
            width={28}
            height={28}
            className="rounded-md border border-foreground/15"
          />
          <div className="text-sm font-semibold">Unsaid</div>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          {username ? (
            <Link
              href={`/${username}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
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
              href="/account"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
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
        </nav>
      </aside>
      <div className="mx-auto flex max-w-5xl gap-6 px-5 py-8 md:pl-64">
        <main className="min-w-0 flex-1">
          <MobileNav username={username} isOwner={isOwner} />
          <div className="mt-4 md:mt-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
