"use client";

import { useState, useTransition } from "react";
import { deleteMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon } from "@hugeicons/core-free-icons";

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
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="xs"
            disabled={isPending || done}
            title={done ? "Deleted" : "Delete"}
          >
            {done ? (
              "Deleted"
            ) : (
              <HugeiconsIcon
                icon={Delete01Icon}
                size={18}
                color="currentColor"
                strokeWidth={1.5}
              />
            )}
            <span className="sr-only">Delete</span>
          </Button>
        }
      />
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this message?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || done}
            onClick={() => {
              startTransition(async () => {
                await deleteMessage(messageId, recipientUsername);
                setDone(true);
              });
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
