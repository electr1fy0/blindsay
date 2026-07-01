"use client";

import { useState, useTransition } from "react";
import { deleteMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type DeleteMessageButtonProps = {
  messageId: string;
  recipientUsername: string;
  size?: "xs" | "sm" | "icon-xs" | "default" | "lg";
  className?: string;
  onSuccess?: () => void;
};

export function DeleteMessageButton({
  messageId,
  recipientUsername,
  size = "icon-xs",
  className,
  onSuccess,
}: DeleteMessageButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size={size}
            disabled={isPending || done}
            title={done ? "Deleted" : "Delete"}
            className={className}
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
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete this message?</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button
            variant="destructive"
            disabled={isPending || done}
            onClick={() => {
              startTransition(async () => {
                const result = await deleteMessage(messageId, recipientUsername);
                if (result.success) {
                  setDone(true);
                  setOpen(false);
                  onSuccess?.();
                  router.refresh();
                  toast("Deleted.");
                } else {
                  toast.error(result.message || "Failed to delete message.");
                }
              });
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
