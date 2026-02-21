import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DeleteMessageButton } from "@/components/message-actions";
import { EditReplyButton } from "@/components/edit-reply-button";
import { ShareMessageButton } from "@/components/share-message-button";
import { MessageCard } from "@/components/message-card";

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

  const messages = await prisma.message.findMany({
    where: {
      recipientId: user.id,
      parentId: null,
      replies: { some: {} },
    },
    orderBy: { createdAt: "desc" },
    include: {
      replies: { orderBy: { createdAt: "asc" }, take: 1 },
    },
  });
  const now = new Date();

  return (
    <div className="page-stack">
      <div className="section-header">
        <h1 className="text-2xl font-semibold">Published</h1>
        <p className="text-sm text-muted-foreground">
          Replies are public by default.
        </p>
      </div>
      {messages.length === 0 ? (
        <div className="panel-card p-4 text-sm text-muted-foreground">
          No replies yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const reply = message.replies[0];
            if (!reply) return null;
            return (
              <MessageCard
                key={message.id}
                message={message}
                reply={reply}
                now={now}
                replyActions={
                  <>
                    <ShareMessageButton
                      messageContent={message.content}
                      replyContent={reply.content}
                      username={user.username ?? ""}
                    />
                    <EditReplyButton
                      replyId={reply.id}
                      recipientUsername={user.username ?? ""}
                      initialContent={reply.content}
                    />
                    <DeleteMessageButton
                      messageId={reply.id}
                      recipientUsername={user.username ?? ""}
                    />
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
