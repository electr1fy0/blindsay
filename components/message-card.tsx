import type { ReactNode } from "react";
import type { MessageModel as Message } from "@/lib/generated/prisma/models";
import { formatRelativeTime } from "@/lib/relative-time";

interface MessageCardProps {
  message: Message;
  reply?: Message | null;
  now?: Date;
  messageActions?: ReactNode;
  replyActions?: ReactNode;
  replyForm?: ReactNode;
}

export function MessageCard({
  message,
  reply,
  now = new Date(),
  messageActions,
  replyActions,
  replyForm,
}: MessageCardProps) {
  return (
    <div className="panel-card px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="shrink-0 whitespace-nowrap text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
          {formatRelativeTime(message.createdAt, now)}
        </p>
        {messageActions ? (
          <div className="flex items-center gap-1 sm:gap-2">{messageActions}</div>
        ) : null}
      </div>
      <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed pl-1">
        {message.content}
      </p>

      {reply ? (
        <div className="mt-2 space-y-1">
          <div className="panel-card-subtle px-4 pb-3 pt-2 mt-4">
            <div className="flex items-center justify-between gap-2 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              <div className="flex min-w-0 items-center gap-2">
                <span>Reply</span>
                <span>·</span>
                <span className="shrink-0 whitespace-nowrap">
                  {formatRelativeTime(reply.createdAt, now)}
                </span>
              </div>
              {replyActions ? (
                <div className="flex items-center gap-1 sm:gap-2">{replyActions}</div>
              ) : null}
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed pl-1">
              {reply.content}
            </p>
          </div>
        </div>
      ) : null}

      {replyForm ? <div className="mt-2">{replyForm}</div> : null}
    </div>
  );
}
