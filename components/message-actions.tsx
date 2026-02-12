"use client";

import { useState, useTransition } from "react";
import { deleteMessage, toggleReplyVisibility } from "@/app/actions";
import { Button } from "@/components/ui/button";

type DeleteMessageButtonProps = {
  messageId: string;
  recipientUsername: string;
};

export function DeleteMessageButton({
  messageId,
  recipientUsername,
}: DeleteMessageButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <Button
      variant="ghost"
      size="xs"
      disabled={isPending || done}
      onClick={() => {
        if (!window.confirm("Delete this message?")) return;
        startTransition(async () => {
          await deleteMessage(messageId, recipientUsername);
          setDone(true);
        });
      }}
    >
      {done ? "Deleted" : isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}

type ToggleReplyVisibilityButtonProps = {
  replyId: string;
  recipientUsername: string;
  isPublic: boolean;
};

export function ToggleReplyVisibilityButton({
  replyId,
  recipientUsername,
  isPublic,
}: ToggleReplyVisibilityButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(isPublic);

  return (
    <Button
      variant="ghost"
      size="xs"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await toggleReplyVisibility(replyId, recipientUsername);
          setValue((prev) => !prev);
        });
      }}
    >
      {isPending ? "Saving..." : value ? "Hide" : "Publish"}
    </Button>
  );
}
