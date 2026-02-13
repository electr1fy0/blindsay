"use client";

import { useState, useTransition } from "react";
import { updateReplyMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit01Icon } from "@hugeicons/core-free-icons";

type EditReplyButtonProps = {
  replyId: string;
  recipientUsername: string;
  initialContent: string;
};

export function EditReplyButton({
  replyId,
  recipientUsername,
  initialContent,
}: EditReplyButtonProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialContent);
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <Button type="button" variant="ghost" size="xs" title="Edit" onClick={() => setEditing(true)}>
        <HugeiconsIcon icon={Edit01Icon} size={18} color="currentColor" strokeWidth={1.5} />
        <span className="sr-only">Edit</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-8 w-44 rounded-2xl bg-background/80"
        disabled={isPending}
      />
      <Button
        type="button"
        size="xs"
        disabled={isPending || !value.trim()}
        onClick={() => {
          startTransition(async () => {
            await updateReplyMessage(replyId, recipientUsername, value);
            setEditing(false);
          });
        }}
      >
        {isPending ? "Saving..." : "Save"}
      </Button>
      <Button type="button" variant="ghost" size="xs" onClick={() => setEditing(false)}>
        Cancel
      </Button>
    </div>
  );
}
