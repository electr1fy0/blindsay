import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";
import { AuthButtons } from "@/components/auth-buttons";
import { UsernameForm } from "@/components/username-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PublicLimitForm } from "@/components/public-limit-form";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { username: true, name: true, email: true, publicReplyLimit: true },
  });

  if (!user) {
    redirect("/");
  }

  return (
    <AppShell username={user.username} isOwner>
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="text-sm text-muted-foreground">
            Manage your inbox settings and public visibility.
          </p>
        </div>

        <Card className="rounded-3xl border-foreground/10 bg-card/90">
          <CardHeader className="pb-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Profile
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <AuthButtons user={session.user} className="self-start pt-2" />
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-foreground/10 bg-card/90">
          <CardHeader className="pb-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Username
            </div>
          </CardHeader>
          <CardContent>
            {user.username ? (
              <div className="text-sm">
                Your inbox link is{" "}
                <span className="font-semibold">/{user.username}</span>.
              </div>
            ) : (
              <UsernameForm />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-foreground/10 bg-card/90">
          <CardHeader className="pb-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Public Replies
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="text-muted-foreground">
              Limit how many replied messages are visible to the public.
            </div>
            <PublicLimitForm initialValue={user.publicReplyLimit ?? 10} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
