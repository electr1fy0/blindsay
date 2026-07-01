"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createReplyMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePersistedDraft } from "@/lib/use-persisted-draft";
import { motion, AnimatePresence } from "motion/react";
import { IconLoader2 } from "@tabler/icons-react";
import type { MessageModel as Message } from "@/lib/generated/prisma/models";

const MAX_LENGTH = 4000;

type ReplyFormProps = {
  recipientId: string;
  recipientUsername: string;
  parentId: string;
  onSuccess?: (reply: Message) => void;
};

export function ReplyForm({
  recipientId,
  recipientUsername,
  parentId,
  onSuccess,
}: ReplyFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const draft = usePersistedDraft(
    `reply:${recipientId}:${recipientUsername.toLowerCase()}:${parentId}`,
  );
  const content = draft.value;
  const setContent = draft.setValue;

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
          draft.clearDraft();
          setOpen(false);
          if (result.reply) {
            onSuccess?.(result.reply);
          }
          router.refresh();
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

  return (
    <motion.div
      layout
      transition={{
        type: "spring",
        stiffness: 700,
        damping: 42
      }}
      className="w-full overflow-hidden p-1 -m-1"
    >
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.div
            key="reply-button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ type: "spring", stiffness: 600, damping: 38 }}
            className="flex justify-end"
          >
            <Button type="button" size="sm" onClick={() => setOpen(true)}>
              Reply
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="reply-form-content"
            ref={formRef}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: 8,
              transition: { type: "spring", stiffness: 750, damping: 44 }
            }}
            transition={{ type: "spring", stiffness: 550, damping: 36 }}
            className="space-y-2"
          >
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
            {draft.hydrated && content ? (
              <p className="text-xs text-muted-foreground">
                Draft saved on this device.
              </p>
            ) : null}
            <div className="flex items-center justify-between">
              <span
                className={`text-[0.65rem] tabular-nums ${content.length >= MAX_LENGTH ? "text-destructive" : "text-muted-foreground"}`}
              >
                {content.length}/{MAX_LENGTH}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => {
                    setOpen(false);
                    setError(null);
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
                  {isPending ? (
                    <span className="flex items-center gap-1.5">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send reply"
                  )}
                </Button>
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
