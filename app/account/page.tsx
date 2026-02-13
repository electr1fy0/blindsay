import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";
import { AuthButtons } from "@/components/auth-buttons";
import { UsernameForm } from "@/components/username-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toggleInboxOpen } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ToggleOffIcon, ToggleOnIcon } from "@hugeicons/core-free-icons";
import { formatRelativeTime } from "@/lib/relative-time";
import { HiddenWordsForm } from "@/components/hidden-words-form";
import { PauseInboxForm } from "@/components/pause-inbox-form";

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
      inboxOpen: true,
      inboxPausedUntil: true,
      hiddenWords: true,
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
  const latestMessage = await prisma.message.findFirst({
    where: { recipientId: user.id, parentId: null },
    orderBy: { createdAt: "desc" },
  });
  const latestReply = await prisma.message.findFirst({
    where: { recipientId: user.id, parentId: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const isPaused = Boolean(user.inboxPausedUntil && user.inboxPausedUntil > now);
  const latestMessageLabel = latestMessage
    ? formatRelativeTime(latestMessage.createdAt, now)
    : "—";
  const latestReplyLabel = latestReply
    ? formatRelativeTime(latestReply.createdAt, now)
    : "—";

  return (
    <AppShell username={user.username} isOwner>
      <div className="page-stack">
        <div className="section-header">
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="text-sm text-muted-foreground">
            Manage your inbox settings and public visibility.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="panel-card">
            <CardHeader className="pb-3">
              <div className="kicker">At a glance</div>
            </CardHeader>
            <CardContent className="section-grid text-sm md:grid-cols-3">
              <div className="panel-card-muted p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Messages
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {messageStats._count.id}
                </div>
              </div>
              <div className="panel-card-muted p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Latest reply
                </div>
                <div className="mt-2 text-sm font-semibold leading-tight">
                  {latestReplyLabel}
                </div>
              </div>
              <div className="panel-card-muted p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Replies
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {replyStats._count.id}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="panel-card">
            <CardHeader className="pb-3">
              <div className="kicker">Latest activity</div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="panel-card-muted flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Latest message</span>
                <span>
                  {latestMessageLabel}
                </span>
              </div>
              <div className="panel-card-muted flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Latest reply</span>
                <span>
                  {latestReplyLabel}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="panel-card">
            <CardHeader className="pb-3">
              <div className="kicker">Profile & link</div>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.username ? (
                <div className="panel-card-muted px-4 py-3 text-sm">
                  Your inbox link is{" "}
                  <span className="font-semibold">/{user.username}</span>.
                </div>
              ) : null}
              <div className="panel-card-muted p-4">
                <UsernameForm
                  initialValue={user.username ?? ""}
                  submitLabel={
                    user.username ? "Update username" : "Claim username"
                  }
                />
              </div>
              <div className="panel-card-muted p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Account access
                </div>
                <AuthButtons user={session.user} className="self-start pt-3" />
              </div>
            </CardContent>
          </Card>

          <Card className="panel-card">
            <CardHeader className="pb-3">
              <div className="kicker">Inbox status</div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="panel-card-muted px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Status
                </div>
                <div className="mt-2">
                  {user.inboxOpen
                    ? isPaused
                      ? `Paused ${user.inboxPausedUntil ? formatRelativeTime(user.inboxPausedUntil, now) : ""}.`
                      : "Open to new messages."
                    : "Closed to new messages."}
                </div>
              </div>
              <div className="panel-card-muted px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Pause link
                </div>
                <div className="mt-2">
                  <PauseInboxForm isPaused={isPaused} />
                </div>
              </div>
              <div className="panel-card-muted px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Inbox switch
                </div>
                <div className="mt-2">
                  <form
                    action={async () => {
                      "use server";
                      await toggleInboxOpen();
                    }}
                  >
                    <Button
                      type="submit"
                      size="sm"
                      variant={user.inboxOpen ? "destructive" : "default"}
                    >
                      <HugeiconsIcon
                        icon={user.inboxOpen ? ToggleOffIcon : ToggleOnIcon}
                        size={18}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                      {user.inboxOpen ? "Close inbox" : "Open inbox"}
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="panel-card">
            <CardHeader className="pb-3">
              <div className="kicker">Hidden words</div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="panel-card-muted px-4 py-3 text-muted-foreground">
                Filter out messages that contain words or phrases you list.
              </div>
              <HiddenWordsForm initialValue={user.hiddenWords ?? []} />
            </CardContent>
          </Card>
        </div>

        
      </div>
    </AppShell>
  );
}
