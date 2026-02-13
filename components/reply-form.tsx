"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createReplyMessage } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ReplyFormProps = {
  recipientId: string;
  recipientUsername: string;
  parentId: string;
};

export function ReplyForm({
  recipientId,
  recipientUsername,
  parentId,
}: ReplyFormProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;
    startTransition(async () => {
      try {
        setError(null);
        await createReplyMessage(
          recipientId,
          recipientUsername,
          parentId,
          content,
        );
        setContent("");
        setSent(true);
        toast("Sent.");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to send reply.";
        setError(message);
        toast.error(message);
      }
    });
  };

  if (sent) {
    return null;
  }

  if (!open) {
    return (
      <div className="flex justify-end">
        <Button type="button" size="sm" onClick={() => setOpen(true)}>
          Reply
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input
        placeholder="Reply to the message"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={isPending}
        className="h-11 rounded-2xl bg-background/70"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
          {isPending ? "Sending..." : "Send reply"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
