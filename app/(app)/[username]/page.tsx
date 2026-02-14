import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateMessageForm } from "@/components/create-message-form";
import { ReplyForm } from "@/components/reply-form";
import { formatRelativeTime } from "@/lib/relative-time";
import { DeleteMessageButton } from "@/components/message-actions";
import { EditReplyButton } from "@/components/edit-reply-button";
import { SharePanel } from "@/components/share-panel";
import { MessageCard } from "@/components/message-card";

type PageProps = {
  params: Promise<{ username?: string }>;
  searchParams?: Promise<{ page?: string }>;
};

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
      email: true,
      inboxOpen: true,
      inboxPausedUntil: true,
    },
  });

  if (!profile) {
    notFound();
  }

  const isOwner = Boolean(
    session?.user?.email && session.user.email === profile.email,
  );
  const now = new Date();
  const isPaused = Boolean(
    profile.inboxPausedUntil && profile.inboxPausedUntil > now,
  );

  const baseQuery = {
    where: {
      recipientId: profile.id,
      parentId: null,
      ...(isOwner ? {} : { replies: { some: {} } }),
    },
    orderBy: { createdAt: "desc" as const },
    include: {
      replies: {
        orderBy: { createdAt: "asc" as const },
        take: 1,
      },
    },
  };
  const total = await prisma.message.count({
    where: { recipientId: profile.id, parentId: null },
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const messages = await prisma.message.findMany({
    ...baseQuery,
    skip: isOwner ? skip : 0,
    take: isOwner ? pageSize : pageSize,
  });
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  const shareUrl = `${baseUrl}/${profile.username ?? username}`;

  return (
    <div className="page-stack">
      <div className="section-header">
        <h1 className="text-2xl font-semibold">
          {isOwner ? "Your inbox" : `Leave a note for ${profile.username}`}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isOwner
            ? "These messages were sent anonymously."
            : "Your message will be anonymous. Be kind."}
        </p>
      </div>

      {isOwner ? (
        <SharePanel url={shareUrl} />
      ) : profile.inboxOpen && !isPaused ? (
        <section className="panel-card p-4">
          <CreateMessageForm
            recipientId={profile.id}
            recipientUsername={profile.username ?? username}
          />
        </section>
      ) : (
        <section className="panel-card p-4 text-sm text-muted-foreground">
          {profile.inboxOpen && isPaused
            ? `This inbox is paused ${profile.inboxPausedUntil ? formatRelativeTime(profile.inboxPausedUntil, now) : ""}.`
            : "This inbox is currently closed."}
        </section>
      )}

      <section className="flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="panel-card p-4 text-sm text-muted-foreground">
            {isOwner ? "No messages yet." : "No replies yet."}
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
                messageActions={
                  isOwner ? (
                    <DeleteMessageButton
                      messageId={message.id}
                      recipientUsername={profile.username ?? username}
                    />
                  ) : null
                }
                replyActions={
                  isOwner && reply ? (
                    <>
                      <EditReplyButton
                        replyId={reply.id}
                        recipientUsername={profile.username ?? username}
                        initialContent={reply.content}
                      />
                      <DeleteMessageButton
                        messageId={reply.id}
                        recipientUsername={profile.username ?? username}
                      />
                    </>
                  ) : null
                }
                replyForm={
                  isOwner ? (
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
        {isOwner ? (
          <div className="panel-card-subtle inline-flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground">
            <span className="lowercase">
              page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={`/${profile.username ?? username}?page=${page - 1}`}
                  className="panel-card-muted px-3 py-1 text-xs"
                >
                  Previous
                </Link>
              ) : null}
              {page < totalPages ? (
                <Link
                  href={`/${profile.username ?? username}?page=${page + 1}`}
                  className="panel-card-muted px-3 py-1 text-xs"
                >
                  Next
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}