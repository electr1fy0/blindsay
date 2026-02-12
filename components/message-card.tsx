import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MessageModel as Message } from "@/lib/generated/prisma/models";
import { formatRelativeTime } from "@/lib/relative-time";

export type MessageWithReplies = Message & {
  createdAtLabel?: string;
};

interface MessageCardProps {
  message: MessageWithReplies;
}

export function MessageCard({ message }: MessageCardProps) {
  const now = new Date();
  return (
    <Card className="w-full rounded-2xl border-foreground/10 bg-card/80">
      <CardHeader className="pb-1.5">
        <p className="text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
          {message.createdAtLabel ?? formatRelativeTime(message.createdAt, now)}
        </p>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>
      </CardContent>
    </Card>
  );
}
