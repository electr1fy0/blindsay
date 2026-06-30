"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { deleteAccount } from "@/app/actions";
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
import { toast } from "sonner";

type DeleteAccountButtonProps = {
  size?: "xs" | "sm" | "default" | "lg";
  className?: string;
};

export function DeleteAccountButton({
  size = "sm",
  className,
}: DeleteAccountButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            size={size}
            variant="destructive"
            className={className}
            disabled={isPending}
          >
            Delete account
          </Button>
        }
      />
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            Your messages and settings will be preserved. Your username will be
            freed up. You can sign back in at any time to reclaim your account
            and pick a new username.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await deleteAccount();
                if (result.success) {
                  setOpen(false);
                  await signOut({ callbackUrl: "/" });
                } else {
                  toast.error(result.message || "Failed to delete account.");
                }
              });
            }}
          >
            {isPending ? "Deleting…" : "Delete account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
