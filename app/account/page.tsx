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
import { SharePanel } from "@/components/share-panel";

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

  const now = new Date();
  const isPaused = Boolean(user.inboxPausedUntil && user.inboxPausedUntil > now);
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  const shareUrl = `${baseUrl}/${user.username}`;

  return (
    <AppShell username={user.username} isOwner>
      <div className="page-stack">
        <div className="section-header">
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile and inbox settings.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Card className="panel-card h-fit">
              <CardHeader className="pb-3">
                <div className="kicker">Identity</div>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.username ? (
                  <div className="panel-card-muted overflow-hidden">
                    <SharePanel
                      url={shareUrl}
                      className="border-0 bg-transparent shadow-none"
                    />
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
                  <div className="kicker">
                    Session
                  </div>
                                  <div className="mt-2">
                                    <AuthButtons user={session.user} size="sm" className="w-full" />
                                  </div>                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card className="panel-card h-fit">
              <CardHeader className="pb-3">
                <div className="kicker">Inbox Controls</div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="panel-card-muted px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                    <div className="kicker">
                      Status
                    </div>
                      <div className="mt-1 font-medium">
                        {user.inboxOpen
                          ? isPaused
                            ? "Paused"
                            : "Active"
                          : "Closed"}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {user.inboxOpen
                          ? isPaused
                            ? `Resumes ${user.inboxPausedUntil ? formatRelativeTime(user.inboxPausedUntil, now) : "soon"}.`
                            : "Accepting new messages."
                          : "Not accepting messages."}
                      </div>
                    </div>
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
                        title={user.inboxOpen ? "Close inbox" : "Open inbox"}
                      >
                        <HugeiconsIcon
                          icon={user.inboxOpen ? ToggleOnIcon : ToggleOffIcon}
                          size={18}
                          color="currentColor"
                          strokeWidth={1.5}
                        />
                        {user.inboxOpen ? "Close" : "Open"}
                      </Button>
                    </form>
                  </div>
                </div>

                              <div className="panel-card-muted px-4 py-3">
                                <div className="flex items-center justify-between gap-4">
                                  <div>
                                    <div className="kicker">
                                      Pause
                                    </div>
                                    <div className="mt-1 font-medium">
                                      {isPaused ? "Active" : "Ready"}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      {isPaused
                                        ? `Paused until ${
                                            user.inboxPausedUntil
                                              ? formatRelativeTime(user.inboxPausedUntil, now)
                                              : "later"
                                          }.`
                                        : "Temporarily stop new messages."}
                                    </div>
                                  </div>
                                  <PauseInboxForm isPaused={isPaused} />
                                </div>
                              </div>              </CardContent>
            </Card>

            <Card className="panel-card">
              <CardHeader className="pb-3">
                <div className="kicker">Moderation</div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="panel-card-muted px-4 py-3 text-muted-foreground">
                  Messages containing these words will be blocked.
                </div>
                <HiddenWordsForm initialValue={user.hiddenWords ?? []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}