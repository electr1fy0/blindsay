import { useCreateReply } from "@/hooks/use-messages";
import type { Message } from "@/types";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";

type MessageItemProps = Pick<Message, "id" | "content" | "reply">;

export function MessageItem({ content, reply, id }: MessageItemProps) {
  const [replyDraft, setReplyDraft] = useState("");
  const { mutate: sendReply } = useCreateReply("ayush");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendReply({ messageId: id, content: replyDraft });
  };

  return (
    <Card className="my-4">
      <CardHeader>{content}</CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {reply ? (
            <div className="my-4 border p-4 border-neutral-400">{reply}</div>
          ) : (
            <>
              <Input
                type="text"
                placeholder="Enter your reply..."
                required
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
              />
              <Button type="submit" variant="default" className="mt-4">
                Reply
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
