import Link from "next/link";
import Image from "next/image";
import { AuthButtons } from "@/components/auth-buttons";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification03Icon,
  Message01Icon,
  Link01Icon,
  QrCode01Icon,
  Shield01Icon,
  ViewOffIcon,
  Settings01Icon,
  ToggleOnIcon,
} from "@hugeicons/core-free-icons";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const viewer = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { username: true, name: true },
      })
    : null;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-5 py-10">
        <header className="grid gap-6 rounded-3xl border border-foreground/10 bg-card/90 p-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Image
                src="/unsaid.png"
                alt="Unsaid logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <p className="text-sm uppercase tracking-[0.12em] text-muted-foreground">
                Unsaid
              </p>
            </div>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Anonymous inbox, precise publishing.
            </h1>
            <p className="text-sm text-muted-foreground">
              Share one link. Receive honest notes. Publish only the replies you
              choose, with limits and controls.
            </p>
            <div className="flex flex-wrap gap-2">
              {!session ? (
                <AuthButtons user={null} size="lg" />
              ) : viewer?.username ? (
                <Link
                  href={`/${viewer.username}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "rounded-2xl",
                  )}
                >
                  Open inbox
                </Link>
              ) : (
                <Link
                  href="/onboarding"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "rounded-2xl",
                  )}
                >
                  Claim username
                </Link>
              )}
            </div>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-background/90 p-4">
            <div className="rounded-2xl border border-foreground/15 border-dashed bg-card/80 p-4 text-sm">
              <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                <span>Share link</span>
                <span>/you</span>
              </div>
              <div className="mt-3 grid gap-2">
                <div className="rounded-2xl border border-foreground/10 bg-muted/30 p-3">
                  “I never said this, but…”
                </div>
                <div className="rounded-2xl border border-foreground/10 bg-muted/30 p-3">
                  “Thanks for showing up.”
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
              <div className="rounded-2xl border border-foreground/10 bg-card/80 p-3">
                Replies can be published or hidden.
              </div>
              <div className="rounded-2xl border border-foreground/10 bg-card/80 p-3">
                Inbox can be opened or closed anytime.
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            {
              icon: Notification03Icon,
              title: "Inbox",
              text: "Receive anonymous notes in one private stream.",
            },
            {
              icon: Message01Icon,
              title: "Replies",
              text: "Reply to publish, hide when you want.",
            },
            {
              icon: Link01Icon,
              title: "Share",
              text: "One clean link for all conversations.",
            },
            {
              icon: QrCode01Icon,
              title: "QR",
              text: "Instant QR sharing for offline moments.",
            },
            {
              icon: Shield01Icon,
              title: "Safety",
              text: "Rate limits, reports, and basic filtering.",
            },
            {
              icon: Settings01Icon,
              title: "Controls",
              text: "Limit public replies and close your inbox.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-foreground/10 bg-card/90 p-4 text-sm"
            >
              <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                <HugeiconsIcon
                  icon={item.icon}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                {item.title}
              </div>
              <p className="mt-3">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-foreground/10 bg-card/90 p-6">
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Visibility engine</h2>
              <p className="text-sm text-muted-foreground">
                Replies become the public record. Everything else stays private.
              </p>
            </div>
            <div className="rounded-3xl border border-foreground/15 border-dashed bg-background/90 p-4">
              <div className="grid gap-3 text-xs text-muted-foreground">
                <div className="rounded-2xl border border-foreground/10 bg-card/90 p-3">
                  Anonymous message arrives
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="rounded-2xl border border-foreground/10 bg-card/90 p-3">
                    Reply published
                  </div>
                  <div className="rounded-2xl border border-foreground/10 bg-card/90 p-3">
                    Reply hidden
                  </div>
                </div>
                <div className="rounded-2xl border border-foreground/10 bg-card/90 p-3">
                  Public feed shows last N replies
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4 text-sm">
            <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              <HugeiconsIcon
                icon={ToggleOnIcon}
                size={18}
                color="currentColor"
                strokeWidth={1.5}
              />
              Inbox switch
            </div>
            <p className="mt-3">Open or close your inbox in one tap.</p>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4 text-sm">
            <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              <HugeiconsIcon
                icon={ViewOffIcon}
                size={18}
                color="currentColor"
                strokeWidth={1.5}
              />
              Privacy
            </div>
            <p className="mt-3">Unreplied notes never show publicly.</p>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4 text-sm">
            <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              <HugeiconsIcon
                icon={Shield01Icon}
                size={18}
                color="currentColor"
                strokeWidth={1.5}
              />
              Safety
            </div>
            <p className="mt-3">Reports and rate limits reduce abuse.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-foreground/10 bg-card/90 p-6">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Visibility limits</h2>
              <p className="text-sm text-muted-foreground">
                Decide how many replied messages are public at a time.
              </p>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-background/80 p-4 text-sm">
              Example: show only the last 10 replied notes.
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-6">
            <h2 className="text-xl font-semibold">Safety & moderation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Abuse controls are lightweight by default and grow with your
              inbox.
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="rounded-2xl border border-foreground/10 bg-background/90 p-3">
                Rate-limited anonymous sends.
              </div>
              <div className="rounded-2xl border border-foreground/10 bg-background/90 p-3">
                Report buttons on public messages.
              </div>
              <div className="rounded-2xl border border-foreground/10 bg-background/90 p-3">
                Basic abusive language filter.
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-6">
            <h2 className="text-xl font-semibold">Mobile ready</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The inbox, account, and share tools are all accessible on mobile.
            </p>
            <div className="mt-4 rounded-2xl border border-foreground/15 border-dashed bg-background/90 p-4 text-sm">
              Sidebar collapses into a menu. Share link and QR are one tap away.
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-foreground/10 bg-card/90 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Start your inbox today.
              </h2>
              <p className="text-sm text-muted-foreground">
                It takes a minute to claim your username.
              </p>
            </div>
            <div className="flex gap-2">
              {viewer?.username ? (
                <Link
                  href={`/${viewer.username}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "rounded-2xl",
                  )}
                >
                  Open inbox
                </Link>
              ) : (
                <Link
                  href="/onboarding"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "rounded-2xl",
                  )}
                >
                  Claim username
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
