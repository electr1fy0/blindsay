import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateMessageForm } from "@/components/create-message-form";
import { ReplyForm } from "@/components/reply-form";
import { formatRelativeTime } from "@/lib/relative-time";
import { MessageCard } from "@/components/message-card";
import { MarkMessagesSeen } from "@/components/new-badge";
import { AutoRefresh } from "@/components/auto-refresh";
import { SharePanel } from "@/components/share-panel";
import { ThemeToggle } from "@/components/theme-toggle";

type PageProps = {
  params: Promise<{ username?: string }>;
  searchParams?: Promise<{ page?: string; filter?: string }>;
};

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const username = resolvedParams?.username?.toLowerCase();
  if (!username) return {};

  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}/${username}`;
  const ogImageUrl = `${baseUrl}/api/og/${username}`;

  return {
    title: `Leave a note for @${username}`,
    alternates: { canonical: pageUrl },
    openGraph: {
      url: pageUrl,
      title: `Leave a note for @${username}`,
      description:
        "Anonymous inboxes for the words people never said out loud.",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `@${username} on Blindsay`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Leave a note for @${username}`,
      description:
        "Anonymous inboxes for the words people never said out loud.",
      images: [ogImageUrl],
    },
  };
}

export default async function UserInboxPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  if (!resolvedParams?.username) {
    notFound();
  }
  const username = resolvedParams.username.toLowerCase();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const filter =
    resolvedSearchParams?.filter === "published" ? "published" : "all";
  const page = Math.max(1, Number(resolvedSearchParams?.page ?? 1));
  const pageSize = 12;
  const skip = (page - 1) * pageSize;
  const session = await getServerSession(authOptions);

  const profile = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      inboxOpen: true,
      inboxPausedUntil: true,
    },
  });

  if (!profile) {
    notFound();
  }

  const isOwner = Boolean(
    session?.user?.id && session.user.id === profile.id,
  );
  const now = new Date();
  const isPaused = Boolean(
    profile.inboxPausedUntil && profile.inboxPausedUntil > now,
  );

  const baseWhere = {
    recipientId: profile.id,
    parentId: null as null,
    deletedAt: null,
    ...(isOwner
      ? filter === "published"
        ? { replies: { some: {} } }
        : {}
      : { replies: { some: {} } }),
  };
  const totalWhere = {
    recipientId: profile.id,
    parentId: null as null,
    deletedAt: null,
    ...(isOwner
      ? filter === "published"
        ? { replies: { some: {} } }
        : {}
      : {}),
  };
  const [total, publishedCount, messages] = await Promise.all([
    prisma.message.count({
      where: totalWhere,
    }),
    isOwner
      ? prisma.message.count({
          where: {
            recipientId: profile.id,
            parentId: null,
            deletedAt: null,
            replies: { some: {} },
          },
        })
      : Promise.resolve(0),
    prisma.message.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" as const },
      include: {
        replies: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" as const },
          take: 1,
        },
      },
      skip: isOwner ? skip : 0,
      take: pageSize,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const baseUrl = getBaseUrl();
  const shareUrl = `${baseUrl}/${profile.username ?? username}`;

  if (!isOwner) {
    const publishedMessages = messages.filter((m) => m.replies[0] != null);

    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-1 sm:px-2">
        <div className="flex items-start justify-between gap-4">
          <div className="section-header">
            <h1 className="text-2xl font-semibold">
              @{profile.username ?? username}
            </h1>
            <p className="text-sm text-muted-foreground">
              Anonymous notes stay private until they are replied to.
            </p>
          </div>
          <ThemeToggle className="shrink-0" />
        </div>

        <div className="panel-card px-6 py-6 sm:px-7">
          <div className="flex flex-col gap-2">
            <p className="kicker">Leave a note</p>
            <p className="max-w-xl text-sm text-muted-foreground">
              Send something honest. Your name is never attached, and only a replied exchange becomes public.
            </p>
          </div>

          {profile.inboxOpen && !isPaused ? (
            <div className="mt-5">
              <CreateMessageForm
                recipientId={profile.id}
                recipientUsername={profile.username ?? username}
              />
            </div>
          ) : (
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {profile.inboxOpen && isPaused
                ? `This inbox is paused ${profile.inboxPausedUntil ? formatRelativeTime(profile.inboxPausedUntil, now) : ""}.`
                : "This inbox is currently closed."}
            </p>
          )}
        </div>

        {publishedMessages.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 px-1">
              <p className="kicker">Published replies</p>
              <span className="rounded-full border border-border bg-muted/35 px-2.5 py-1 text-[0.65rem] text-muted-foreground">
                {publishedMessages.length}
              </span>
            </div>
            <div className="panel-card p-4 sm:p-5">
              <div className="space-y-4">
                {publishedMessages.map((message) => {
                  const reply = message.replies[0]!;
                  return (
                    <MessageCard
                      key={message.id}
                      message={message}
                      reply={reply}
                      now={now}
                      recipientUsername={profile.username ?? username}
                      isOwner={false}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="panel-card p-6 text-center">
            <p className="kicker">Published replies</p>
            <p className="mt-3 text-sm text-muted-foreground">
              No replies yet. Be the first to leave a note.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-2 sm:px-4">
      <AutoRefresh />
      <MarkMessagesSeen messageIds={messages.map((m) => m.id)} />
      <div className="grid gap-8 xl:gap-16 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="page-stack min-w-0">
          <div className="section-header">
            <h1 className="text-2xl font-semibold">Your inbox</h1>
            <p className="text-sm text-muted-foreground">
              These messages were sent anonymously.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-1 rounded-full border border-border bg-muted/35 p-1 shadow-xs">
            <Link
              href={`/${profile.username ?? username}?filter=all`}
              className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === "all"
                  ? "border-foreground/12 bg-background text-foreground shadow-xs"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>All</span>
            </Link>
            <Link
              href={`/${profile.username ?? username}?filter=published`}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === "published"
                  ? "border-foreground/12 bg-background text-foreground shadow-xs"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Published</span>
              <span className="rounded-full bg-foreground/8 px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                {publishedCount}
              </span>
            </Link>
          </div>

          <section className="flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="panel-card p-4 text-sm text-muted-foreground">
                {filter === "published"
                  ? "No published replies yet."
                  : "No messages yet."}
              </div>
            ) : (
              messages.map((message) => {
                const reply = message.replies[0] ?? null;
                return (
                  <MessageCard
                    key={message.id}
                    message={message}
                    reply={reply}
                    now={now}
                    recipientUsername={profile.username ?? username}
                    isOwner={true}
                    replyForm={
                      !reply ? (
                        <ReplyForm
                          recipientId={profile.id}
                          recipientUsername={profile.username ?? username}
                          parentId={message.id}
                        />
                      ) : null
                    }
                  />
                );
              })
            )}
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-4 rounded-full border border-border bg-muted/15 px-4 py-1.5 text-xs text-muted-foreground shadow-2xs">
                {page > 1 ? (
                  <Link
                    href={`/${profile.username ?? username}?filter=${filter}&page=${page - 1}`}
                    className="cursor-pointer font-semibold transition-colors hover:text-foreground"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="cursor-not-allowed opacity-40">Previous</span>
                )}
                <span className="text-border">|</span>
                <span className="font-medium text-foreground">
                  page {page} of {totalPages}
                </span>
                <span className="text-border">|</span>
                {page < totalPages ? (
                  <Link
                    href={`/${profile.username ?? username}?filter=${filter}&page=${page + 1}`}
                    className="cursor-pointer font-semibold transition-colors hover:text-foreground"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="cursor-not-allowed opacity-40">Next</span>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="hidden xl:block xl:pl-6">
          <div className="sticky top-8">
            <SharePanel
              url={shareUrl}
              orientation="vertical"
              className="w-full"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
