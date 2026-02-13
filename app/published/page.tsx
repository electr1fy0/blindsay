import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";
import { formatRelativeTime } from "@/lib/relative-time";
import { DeleteMessageButton } from "@/components/message-actions";
import { EditReplyButton } from "@/components/edit-reply-button";

export default async function PublishedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, username: true },
  });

  if (!user) {
    redirect("/");
  }

  const replies = await prisma.message.findMany({
    where: { recipientId: user.id, parentId: { not: null } },
    orderBy: { createdAt: "desc" },
  });
  const now = new Date();

  return (
    <AppShell username={user.username} isOwner>
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Published</h1>
          <p className="text-sm text-muted-foreground">
            Toggle which replies are visible on your public page.
          </p>
        </div>
        {replies.length === 0 ? (
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4 text-sm text-muted-foreground">
            No replies yet.
          </div>
        ) : (
          <div className="space-y-3">
            {replies.map((reply) => (
              <div
                key={reply.id}
                className="rounded-2xl border border-foreground/10 bg-card/90 px-5 py-4"
              >
                <div className="flex items-center justify-between gap-3 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                  <span>{formatRelativeTime(reply.createdAt, now)}</span>
                  <div className="flex items-center gap-2">
                    <EditReplyButton
                      replyId={reply.id}
                      recipientUsername={user.username ?? ""}
                      initialContent={reply.content}
                    />
                    <DeleteMessageButton
                      messageId={reply.id}
                      recipientUsername={user.username ?? ""}
                    />
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {reply.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
