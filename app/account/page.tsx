import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";
import { AuthButtons } from "@/components/auth-buttons";
import { UsernameForm } from "@/components/username-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PublicLimitForm } from "@/components/public-limit-form";
import { toggleInboxOpen } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      publicReplyLimit: true,
      inboxOpen: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  const messageStats = await prisma.message.aggregate({
    where: { recipientId: user.id, parentId: null },
    _count: { id: true },
  });
  const replyStats = await prisma.message.aggregate({
    where: { recipientId: user.id, parentId: { not: null } },
    _count: { id: true },
  });
  const publicReplyStats = await prisma.message.aggregate({
    where: { recipientId: user.id, parentId: { not: null }, isPublic: true },
    _count: { id: true },
  });
  const latestMessage = await prisma.message.findFirst({
    where: { recipientId: user.id, parentId: null },
    orderBy: { createdAt: "desc" },
  });
  const latestReply = await prisma.message.findFirst({
    where: { recipientId: user.id, parentId: { not: null } },
    orderBy: { createdAt: "desc" },
  });

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
              Activity
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-2xl border border-foreground/10 bg-background/80 p-3">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Messages
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {messageStats._count.id}
              </div>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-background/80 p-3">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Replies
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {replyStats._count.id}
              </div>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-background/80 p-3">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Public
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {publicReplyStats._count.id}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-foreground/10 bg-card/90">
          <CardHeader className="pb-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Latest Activity
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-2">
              <span className="text-muted-foreground">Latest message</span>
              <span>
                {latestMessage
                  ? latestMessage.createdAt.toISOString().slice(0, 10)
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Latest reply</span>
              <span>
                {latestReply
                  ? latestReply.createdAt.toISOString().slice(0, 10)
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-foreground/10 bg-card/90">
          <CardHeader className="pb-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Profile
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Name</span>
              <span>{user.name ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Email</span>
              <span className="break-all">{user.email}</span>
            </div>
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

        <Card className="rounded-3xl border-foreground/10 bg-card/90">
          <CardHeader className="pb-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Inbox Access
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3 text-sm">
            <div className="text-muted-foreground">
              {user.inboxOpen ? "Inbox is open to new messages." : "Inbox is closed."}
            </div>
            <form
              action={async () => {
                "use server";
                await toggleInboxOpen();
              }}
            >
              <Button type="submit" size="sm">
                {user.inboxOpen ? "Close inbox" : "Open inbox"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
