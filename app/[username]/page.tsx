import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateMessageForm } from "@/components/create-message-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReplyForm } from "@/components/reply-form";
import { formatRelativeTime } from "@/lib/relative-time";
import { deleteMessage } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ username?: string }>;
};

export default async function UserInboxPage({ params }: PageProps) {
  const resolvedParams = await params;
  if (!resolvedParams?.username) {
    notFound();
  }
  const username = resolvedParams.username.toLowerCase();
  const session = await getServerSession(authOptions);

  const profile = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      publicReplyLimit: true,
    },
  });

  if (!profile) {
    notFound();
  }

  const isOwner = Boolean(
    session?.user?.email && session.user.email === profile.email
  );

  const baseQuery = {
    where: { recipientId: profile.id, parentId: null },
    orderBy: { createdAt: "desc" as const },
    include: {
      replies: {
        orderBy: { createdAt: "asc" as const },
      },
    },
  };
  const messages = isOwner
    ? await prisma.message.findMany(baseQuery)
    : await prisma.message.findMany({
        ...baseQuery,
        where: {
          recipientId: profile.id,
          parentId: null,
          replies: { some: {} },
        },
        take: profile.publicReplyLimit ?? 10,
      });
  const now = new Date();

  return (
    <AppShell username={profile.username} isOwner={isOwner}>
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            {isOwner ? "Your inbox" : `Leave a note for ${profile.username}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isOwner
              ? "These messages were sent anonymously."
              : "Your message will be anonymous. Be kind."}
          </p>
        </div>

        {isOwner ? null : (
          <section className="rounded-3xl border border-foreground/10 bg-card/90 p-4">
            <CreateMessageForm
              recipientId={profile.id}
              recipientUsername={profile.username ?? username}
            />
          </section>
        )}

        <section className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4 text-sm text-muted-foreground">
              No messages yet.
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className="rounded-2xl border border-foreground/10 bg-card/90 px-5 py-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                    {formatRelativeTime(message.createdAt, now)}
                  </p>
                  {isOwner ? (
                    <form
                      action={async () => {
                        "use server";
                        await deleteMessage(
                          message.id,
                          profile.username ?? username,
                        );
                      }}
                    >
                      <Button variant="ghost" size="xs">
                        Delete
                      </Button>
                    </form>
                  ) : null}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>

                {message.replies.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {message.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="rounded-2xl border border-foreground/10 bg-muted/20 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>Reply</span>
                            <span>·</span>
                            <span>
                              {formatRelativeTime(reply.createdAt, now)}
                            </span>
                          </div>
                          {isOwner ? (
                            <form
                              action={async () => {
                                "use server";
                                await deleteMessage(
                                  reply.id,
                                  profile.username ?? username,
                                );
                              }}
                            >
                              <Button variant="ghost" size="xs">
                                Delete
                              </Button>
                            </form>
                          ) : null}
                        </div>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {isOwner ? (
                  <div className="mt-2">
                    <div className="rounded-2xl border border-foreground/10 bg-muted/10 px-3 py-2">
                      <ReplyForm
                        recipientId={profile.id}
                        recipientUsername={profile.username ?? username}
                        parentId={message.id}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </section>
      </div>
    </AppShell>
  );
}
