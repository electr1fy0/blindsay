"use client";

import { useState, useTransition } from "react";
import { createReplyMessage } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ReplyFormProps = {
  recipientId: string;
  recipientUsername: string;
  parentId: string;
};

export function ReplyForm({ recipientId, recipientUsername, parentId }: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;
    startTransition(async () => {
      try {
        setError(null);
        await createReplyMessage(recipientId, recipientUsername, parentId, content);
        setContent("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send reply.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="Reply with care."
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={isPending}
        className="bg-background/70"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
          {isPending ? "Sending..." : "Reply"}
        </Button>
      </div>
    </form>
  );
}
