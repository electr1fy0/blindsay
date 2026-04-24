"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { createReplyMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_LENGTH = 500;

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
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;
    startTransition(async () => {
      try {
        setError(null);
        const result = await createReplyMessage(
          recipientId,
          recipientUsername,
          parentId,
          content,
        );
        if (result.success) {
          setContent("");
          setSent(true);
          toast("Sent.");
        } else {
          const message = result.message ?? "Failed to send reply.";
          setError(message);
          toast.error(message);
        }
      } catch (err) {
        const message = "Failed to send reply.";
        setError(message);
        toast.error(message);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder="Reply to the message"
        value={content}
        onChange={(event) =>
          setContent(event.target.value.slice(0, MAX_LENGTH))
        }
        onKeyDown={handleKeyDown}
        disabled={isPending}
        className="min-h-[112px] max-h-72 sm:text-sm"
      />
      <div className="flex items-center justify-between">
        <span
          className={`text-[0.65rem] tabular-nums ${content.length >= MAX_LENGTH ? "text-destructive" : "text-muted-foreground"}`}
        >
          {content.length}/{MAX_LENGTH}
        </span>
        <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
          {isPending ? "Sending..." : "Send reply"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
