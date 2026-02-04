import { useReplyToMessage } from "@/hooks/messages";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";

type MessageItemProps = {
  content: string;
  id?: number;
  recipientId?: number;
  reply?: string;
};

export function MessageItem({ content, reply, id }: MessageItemProps) {
  const [replyDraft, setReplyDraft] = useState<string>("");
  const { mutate: replyToMsg } = useReplyToMessage();

  return (
    <Card className="my-4">
      <CardHeader>{content}</CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            replyToMsg({ mid: id!, content: replyDraft });
          }}
        >
          {reply ? (
            <div className="my-4 border p-4 border-neutral-400">{reply} </div>
          ) : (
            <>
              <Input
                type="text"
                placeholder="Enter your reply..."
                required
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
              ></Input>
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
