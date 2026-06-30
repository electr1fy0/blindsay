import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthButtons } from "@/components/auth-buttons";
import { UsernameForm } from "@/components/username-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toggleInboxOpen } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ToggleOffIcon, ToggleOnIcon, GithubIcon, StarIcon } from "@hugeicons/core-free-icons";
import { formatRelativeTime } from "@/lib/relative-time";
import { HiddenWordsForm } from "@/components/hidden-words-form";
import { PauseInboxForm } from "@/components/pause-inbox-form";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { SharePanel } from "@/components/share-panel";
import Link from "next/link";

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

  const ghRes = await fetch("https://api.github.com/repos/electr1fy0/blindsay", {
    next: { revalidate: 3600 },
    headers: { Accept: "application/vnd.github+json" },
  }).catch(() => null);
  const ghData = ghRes?.ok ? await ghRes.json() : null;
  const starCount: number | null = ghData?.stargazers_count ?? null;
  const formattedStars =
    starCount === null
      ? null
      : starCount >= 1000
        ? `${(starCount / 1000).toFixed(1)}k`
        : String(starCount);

  return (
    <div className="page-stack mx-auto w-full max-w-3xl">
      <div className="section-header">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and inbox settings.
        </p>
      </div>

      <Card className="panel-card">
        <CardHeader className="pb-0">
          <div className="kicker">Identity</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="panel-card-muted p-4">
            <div className="space-y-4">
              <AuthButtons user={session.user} size="sm" className="w-full" />
              <div className="border-t border-foreground/10 pt-4">
                <UsernameForm
                  initialValue={user.username ?? ""}
                  submitLabel={user.username ? "Update username" : "Claim username"}
                />
              </div>
            </div>
          </div>

          {user.username ? (
            <div className="panel-card-muted overflow-hidden">
              <SharePanel
                url={shareUrl}
                orientation="horizontal"
                className="border-0 bg-transparent shadow-none"
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="panel-card">
        <CardHeader className="pb-3">
          <div className="kicker">Inbox Controls</div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="panel-card-muted px-4 py-3">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="kicker">Status</div>
                <div className="mt-1 font-medium">
                  {user.inboxOpen ? (isPaused ? "Paused" : "Active") : "Closed"}
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
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="kicker">Pause</div>
                <div className="mt-1 font-medium">{isPaused ? "Active" : "Ready"}</div>
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
          </div>
        </CardContent>
      </Card>

      <Card className="panel-card">
        <CardHeader className="pb-3">
          <div className="kicker">Moderation</div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <HiddenWordsForm initialValue={user.hiddenWords ?? []} />
        </CardContent>
      </Card>

      <div className="panel-card px-4 py-4">
        <div className="kicker mb-3">Open source</div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Built in public.</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Read the code, contribute, or leave a star.
            </p>
          </div>
          <span className="github-badge-wrap inline-flex shrink-0 self-center">
            <Link
              href="https://github.com/electr1fy0/blindsay"
              target="_blank"
              rel="noopener noreferrer"
              className="github-badge flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-3 transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={GithubIcon} size={14} color="currentColor" strokeWidth={1.5} />
              <span className="text-xs font-medium text-muted-foreground">Star on GitHub</span>
              <HugeiconsIcon icon={StarIcon} size={13} color="currentColor" strokeWidth={1.5} />
              {formattedStars !== null && (
                <span className="text-sm font-semibold tabular-nums text-muted-foreground">{formattedStars}</span>
              )}
            </Link>
          </span>
        </div>
      </div>

      <Card className="panel-card border-destructive/20">
        <CardHeader className="pb-3">
          <div className="kicker text-destructive">Danger Zone</div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="panel-card-muted px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">Delete account</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Your username will be freed and you will be signed out. You
                  can sign back in anytime to restore your account and data.
                </div>
              </div>
              <DeleteAccountButton />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
