"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createAnonymousMessage } from "@/app/actions";
import { usePersistedDraft } from "@/lib/use-persisted-draft";

const MAX_LENGTH = 500;

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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const draft = usePersistedDraft(
    `anonymous:${recipientId}:${recipientUsername.toLowerCase()}`,
  );
  const content = draft.value;
  const setContent = draft.setValue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      try {
        setError(null);
        const result = await createAnonymousMessage(
          recipientId,
          recipientUsername,
          content,
        );

        if (!result.success) {
          const message = result.message || "Failed to send message.";
          setError(message);
          toast.error(message);
          return;
        }

        draft.clearDraft();
        setSent(true);
        if (onSuccess) onSuccess();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to send message.";
        setError(message);
        toast.error(message);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <p className="text-sm font-medium">
          Your message was sent anonymously.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Write something honest. It stays anonymous."
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
        onKeyDown={handleKeyDown}
        disabled={isPending}
        className="min-h-[90px] sm:text-sm"
      />
      {draft.hydrated && content ? (
        <p className="text-xs text-muted-foreground">
          Draft saved on this device.
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex items-center justify-between">
        <span
          className={`text-[0.65rem] tabular-nums ${content.length >= MAX_LENGTH ? "text-destructive" : "text-muted-foreground"}`}
        >
          {content.length}/{MAX_LENGTH}
        </span>
        <Button type="submit" disabled={isPending || !content.trim()}>
          {isPending ? "Sending..." : "Send anonymously"}
        </Button>
      </div>
    </form>
  );
}
