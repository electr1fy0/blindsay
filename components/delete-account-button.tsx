"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { deleteAccount } from "@/app/actions";
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
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
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            Your messages and settings will be preserved. Your username will be
            freed up. You can sign back in at any time to reclaim your account
            and pick a new username.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
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
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
