import Link from "next/link";
import Image from "next/image";
import { AuthButtons } from "@/components/auth-buttons";
import { UsernameForm } from "@/components/username-form";
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
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10">
        <header className="rounded-3xl border border-foreground/10 bg-card/80 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Image
                src="/unsaid.png"
                alt="Unsaid logo"
                width={28}
                height={28}
                className="rounded-md border border-foreground/15"
              />
              <p className="text-[0.65rem] uppercase tracking-[0.45em] text-muted-foreground">
                Unsaid
              </p>
            </div>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Anonymous inbox
              <br /> Intentional replies
            </h1>
            <p className="text-sm text-muted-foreground">
              Share one link. Receive honest notes. Publish only the ones you
              respond to.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {!session ? (
              <AuthButtons user={null} />
            ) : viewer?.username ? (
              <Link
                href={`/${viewer.username}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-2xl",
                )}
              >
                Open inbox
              </Link>
            ) : (
              <Link
                href="/onboarding"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-2xl",
                )}
              >
                Claim username
              </Link>
            )}
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-foreground/10 bg-card/80 p-4 text-sm">
            <p className="text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
              Step 01
            </p>
            <p className="mt-2">Pick a username and share your link.</p>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card/80 p-4 text-sm">
            <p className="text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
              Step 02
            </p>
            <p className="mt-2">People send anonymous notes.</p>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card/80 p-4 text-sm">
            <p className="text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
              Step 03
            </p>
            <p className="mt-2">Reply to publish the conversation.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-foreground/10 bg-card/80 p-5">
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-end">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Choose your link</h2>
              <p className="text-sm text-muted-foreground">
                Public visitors only see messages you reply to.
              </p>
            </div>
            <div className="flex md:justify-end">
              {!session ? (
                <AuthButtons user={null} />
              ) : viewer?.username ? (
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-muted-foreground">
                    Your inbox is ready.
                  </div>
                  <Link
                    href={`/${viewer.username}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "rounded-2xl",
                    )}
                  >
                    Go to /{viewer.username}
                  </Link>
                </div>
              ) : (
                <UsernameForm />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
