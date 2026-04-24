"use client";

import { useState, useTransition } from "react";
import { updateReplyMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

const MAX_LENGTH = 500;

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
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialContent);
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button type="button" variant="ghost" size="xs" title="Edit">
            <HugeiconsIcon
              icon={Edit01Icon}
              size={18}
              color="currentColor"
              strokeWidth={1.5}
            />
            <span className="sr-only">Edit</span>
          </Button>
        }
      />
      <AlertDialogContent className="w-[min(92vw,48rem)] max-w-none">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle>Edit reply</AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Review the full draft before publishing changes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={(event) =>
              setValue(event.target.value.slice(0, MAX_LENGTH))
            }
            className="min-h-[180px] max-h-[60vh] sm:text-sm"
            disabled={isPending}
          />
          <span
            className={`block text-[0.65rem] tabular-nums ${value.length >= MAX_LENGTH ? "text-destructive" : "text-muted-foreground"}`}
          >
            {value.length}/{MAX_LENGTH}
          </span>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => setValue(initialContent)}
            disabled={isPending}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            disabled={isPending || !value.trim()}
            onClick={() => {
              startTransition(async () => {
                const result = await updateReplyMessage(
                  replyId,
                  recipientUsername,
                  value,
                );
                if (result.success) {
                  setOpen(false);
                  toast("Updated.");
                } else {
                  toast.error(result.message || "Failed to update reply.");
                }
              });
            }}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
