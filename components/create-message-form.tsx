"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createAnonymousMessage } from "@/app/actions";

interface CreateMessageFormProps {
  recipientId: string;
  recipientUsername: string;
  onSuccess?: () => void;
}

export function CreateMessageForm({
  recipientId,
  recipientUsername,
  onSuccess,
}: CreateMessageFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      try {
        setError(null);
        await createAnonymousMessage(recipientId, recipientUsername, content);
        setContent("");
        if (onSuccess) onSuccess();
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to send message.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Write something honest. It stays anonymous."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
        className="min-h-[110px] bg-background/70"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !content.trim()}>
          {isPending ? "Sending..." : "Send anonymously"}
        </Button>
      </div>
    </form>
  );
}
