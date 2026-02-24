"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  size?: "xs" | "sm" | "default" | "lg";
  className?: string;
};

export function SignOutButton({ size = "sm", className }: SignOutButtonProps) {
  return (
    <Button
      type="button"
      size={size}
      variant="outline"
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </Button>
  );
}
