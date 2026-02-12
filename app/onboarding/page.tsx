import { redirect } from "next/navigation";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UsernameForm } from "@/components/username-form";
import { AuthButtons } from "@/components/auth-buttons";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Image
                src="/unsaid.png"
                alt="Unsaid logo"
                width={24}
                height={24}
                className="rounded-md border border-foreground/15"
              />
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                Unsaid
              </p>
            </div>
            <h1 className="text-3xl font-semibold">Sign in to continue</h1>
            <p className="text-sm text-muted-foreground">
              We need an account before you can claim a username.
            </p>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card/80 p-6">
            <AuthButtons user={null} />
          </div>
        </div>
      </div>
    );
  }

  const viewer = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { username: true },
  });

  if (viewer?.username) {
    redirect(`/${viewer.username}`);
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Image
              src="/unsaid.png"
              alt="Unsaid logo"
              width={24}
              height={24}
              className="rounded-md border border-foreground/15"
            />
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Unsaid
            </p>
          </div>
          <h1 className="text-3xl font-semibold">Claim your username</h1>
          <p className="text-sm text-muted-foreground">
            This becomes your inbox link and can be shared with anyone.
          </p>
        </div>
        <div className="rounded-3xl border border-foreground/10 bg-card/80 p-6">
          <UsernameForm />
        </div>
      </div>
    </div>
  );
}
