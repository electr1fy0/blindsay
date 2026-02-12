"use client";

import { useState, useTransition } from "react";
import { deleteMessage, toggleReplyVisibility } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";

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
      title={done ? "Deleted" : "Delete"}
      onClick={() => {
        if (!window.confirm("Delete this message?")) return;
        startTransition(async () => {
          await deleteMessage(messageId, recipientUsername);
          setDone(true);
        });
      }}
    >
      {done ? "Deleted" : (
        <HugeiconsIcon icon={Delete01Icon} size={18} color="currentColor" strokeWidth={1.5} />
      )}
      <span className="sr-only">Delete</span>
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
      title={value ? "Hide" : "Publish"}
      onClick={() => {
        startTransition(async () => {
          await toggleReplyVisibility(replyId, recipientUsername);
          setValue((prev) => !prev);
        });
      }}
    >
      {isPending ? "Saving..." : value ? (
        <HugeiconsIcon icon={ViewOffIcon} size={18} color="currentColor" strokeWidth={1.5} />
      ) : (
        <HugeiconsIcon icon={ViewIcon} size={18} color="currentColor" strokeWidth={1.5} />
      )}
      <span className="sr-only">{value ? "Hide" : "Publish"}</span>
    </Button>
  );
}
