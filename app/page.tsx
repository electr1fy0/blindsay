import Link from "next/link";
import Image from "next/image";
import { AuthButtons } from "@/components/auth-buttons";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

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
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-10">
        <header className="grid gap-6 rounded-3xl border border-foreground/10 bg-card/90 p-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Image
                src="/unsaid.png"
                alt="Unsaid logo"
                width={28}
                height={28}
                className="rounded-md border border-foreground/15"
              />
              <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                Unsaid
              </p>
            </div>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Anonymous inbox with controlled visibility.
            </h1>
            <p className="text-sm text-muted-foreground">
              Share one link. Receive honest notes. Publish only the ones you
              respond to.
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
                Replies surface publicly.
              </div>
              <div className="rounded-2xl border border-foreground/10 bg-card/80 p-3">
                Unreplied notes stay private.
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4 text-sm">
            <div className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Step 01
            </div>
            <p className="mt-2">Pick a username and share your link.</p>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4 text-sm">
            <div className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Step 02
            </div>
            <p className="mt-2">Anonymous notes arrive in your inbox.</p>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4 text-sm">
            <div className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Step 03
            </div>
            <p className="mt-2">Reply to publish the exchange.</p>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4 text-sm">
            <div className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Control
            </div>
            <p className="mt-2">Limit the number of public replies.</p>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4 text-sm">
            <div className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Privacy
            </div>
            <p className="mt-2">Only replies go public. The rest stays hidden.</p>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4 text-sm">
            <div className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Tone
            </div>
            <p className="mt-2">Keep it simple, sincere, and human.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-foreground/10 bg-card/90 p-6">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Configure your visibility</h2>
              <p className="text-sm text-muted-foreground">
                Decide how many replied messages are public at a time.
              </p>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-background/80 p-4 text-sm">
              Example: show only the last 10 replied notes.
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-foreground/10 bg-card/90 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Start your inbox today.</h2>
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
