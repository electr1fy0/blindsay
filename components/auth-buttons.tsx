"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type AuthButtonsProps = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  className?: string;
  size?: "xs" | "sm" | "default" | "lg";
};

export function AuthButtons({ user, className, size = "default" }: AuthButtonsProps) {
  const [imageOk, setImageOk] = useState(true);

  if (user) {
    const initials = (user.name ?? "U").slice(0, 1).toUpperCase();
    return (
      <div
        className={[
          "flex flex-col gap-2 rounded-2xl border border-foreground/10 bg-muted/40 p-3",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex items-start gap-3 min-w-0">
          {user.image && imageOk ? (
            <Image
              src={user.image}
              alt={user.name ?? "Profile"}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-foreground/20 object-cover"
              onError={() => setImageOk(false)}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/20 bg-background text-sm font-semibold">
              {initials}
            </div>
          )}
          <div className="text-sm min-w-0">
            <div className="font-medium">{user.name ?? "Signed in"}</div>
            <div className="text-xs text-muted-foreground break-all">
              {user.email}
            </div>
          </div>
        </div>
        <Button type="button" variant="outline" size={size} className="self-start" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
      >
        Sign in with Google
      </Button>
    </div>
  );
}
