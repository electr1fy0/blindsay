import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateMessageForm } from "@/components/create-message-form";
import { AuthButtons } from "@/components/auth-buttons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReplyForm } from "@/components/reply-form";
import { formatRelativeTime } from "@/lib/relative-time";
import Image from "next/image";

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
    select: { id: true, username: true, name: true, email: true },
  });

  if (!profile) {
    notFound();
  }

  const isOwner = session?.user?.email && session.user.email === profile.email;

  const messages = await prisma.message.findMany({
    where: { recipientId: profile.id, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
  const now = new Date();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-foreground/10 bg-card/80 p-5">
          <div className="flex items-center gap-3">
            <Image
              src="/unsaid.png"
              alt="Unsaid logo"
              width={24}
              height={24}
              className="rounded-md border border-foreground/15"
            />
            <p className="text-[0.65rem] uppercase tracking-[0.45em] text-muted-foreground">
              Unsaid
            </p>
          </div>
          <AuthButtons user={session?.user ?? null} className="self-start" />
        </header>

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
          <section className="rounded-3xl border border-foreground/10 bg-card/80 p-5">
            <CreateMessageForm
              recipientId={profile.id}
              recipientUsername={profile.username ?? username}
            />
          </section>
        )}

        <section className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="rounded-3xl border border-foreground/10 bg-card/80 p-5 text-sm text-muted-foreground">
              No messages yet.
            </div>
          ) : (
            messages
              .filter((message) => (isOwner ? true : message.replies.length > 0))
              .map((message) => (
                <div key={message.id} className="rounded-3xl border border-foreground/10 bg-card/80 p-4">
                  <Card className="rounded-2xl border-foreground/10 bg-background/80">
                    <CardHeader className="pb-1.5">
                      <p className="text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
                        {formatRelativeTime(message.createdAt, now)}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </CardContent>
                  </Card>

                  {message.replies.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {message.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-2xl border border-foreground/10 bg-muted/20 px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
                            <span>Reply</span>
                            <span>·</span>
                            <span>{formatRelativeTime(reply.createdAt, now)}</span>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {isOwner ? (
                    <div className="mt-3 rounded-2xl border border-foreground/10 bg-background/70 p-3">
                      <div className="mb-2 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
                        Reply to message
                      </div>
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
    </div>
  );
}
