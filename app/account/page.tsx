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
import { BlockSenderButton } from "@/components/block-sender-button";
import { UnblockSenderButton } from "@/components/unblock-sender-button";
import { DeleteMessageButton } from "@/components/message-actions";

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
  const reportedMessages = await prisma.message.findMany({
    where: { recipientId: user.id, reports: { some: {} } },
    include: { reports: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const blockedSenders = await prisma.blockedSender.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const now = new Date();
  const isPaused = Boolean(user.inboxPausedUntil && user.inboxPausedUntil > now);

  return (
    <AppShell username={user.username} isOwner>
      <div className="page-stack">
        <div className="section-header">
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="text-sm text-muted-foreground">
            Manage your inbox settings and public visibility.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
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
                <div className="mt-2 text-2xl font-semibold">
                  {latestReply
                    ? formatRelativeTime(latestReply.createdAt, now)
                    : "—"}
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
                  {latestMessage
                    ? formatRelativeTime(latestMessage.createdAt, now)
                    : "—"}
                </span>
              </div>
              <div className="panel-card-muted flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Latest reply</span>
                <span>
                  {latestReply
                    ? formatRelativeTime(latestReply.createdAt, now)
                    : "—"}
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

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="panel-card">
            <CardHeader className="pb-3">
              <div className="kicker">Reported messages</div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {reportedMessages.length === 0 ? (
                <div className="panel-card-muted p-4 text-xs text-muted-foreground">
                  No reports yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {reportedMessages.map((message) => {
                    const reportCount = message.reports.length;
                    const latestReport = message.reports.reduce((latest, report) => {
                      if (!latest) return report;
                      return report.createdAt > latest.createdAt ? report : latest;
                    }, null as (typeof message.reports)[number] | null);
                    return (
                      <div key={message.id} className="panel-card-muted p-4">
                        <div className="flex items-center justify-between gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                          <span>
                            {reportCount} report{reportCount === 1 ? "" : "s"}
                          </span>
                          <span>
                            {latestReport
                              ? formatRelativeTime(latestReport.createdAt, now)
                              : "—"}
                          </span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <DeleteMessageButton
                            messageId={message.id}
                            recipientUsername={user.username ?? ""}
                          />
                          <BlockSenderButton
                            messageId={message.id}
                            recipientUsername={user.username ?? ""}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="panel-card">
            <CardHeader className="pb-3">
              <div className="kicker">Blocked senders</div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {blockedSenders.length === 0 ? (
                <div className="panel-card-muted p-4 text-xs text-muted-foreground">
                  No blocked senders.
                </div>
              ) : (
                <div className="space-y-2">
                  {blockedSenders.map((blocked) => (
                    <div
                      key={blocked.id}
                      className="panel-card-muted flex items-center justify-between px-4 py-3 text-xs"
                    >
                      <span className="text-muted-foreground">
                        Blocked {formatRelativeTime(blocked.createdAt, now)}
                      </span>
                      <UnblockSenderButton blockId={blocked.id} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
