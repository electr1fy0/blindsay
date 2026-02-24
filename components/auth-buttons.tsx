"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

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
        className={cn(
          "panel-card-subtle flex flex-col gap-2 p-3 border-foreground/10",
          className
        )}
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
          <div className="text-xs min-w-0">
            <div className="font-medium">{user.name ?? "Signed in"}</div>
            <div className="text-muted-foreground break-all">
              {user.email}
            </div>
          </div>
        </div>
        <Button type="button" variant="outline" size={size} className="self-start" onClick={() => signOut({ callbackUrl: "/" })}>
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
        className="gap-2"
        onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 533.5 544.3"
          className="h-4 w-4"
        >
          <path
            fill="#4285F4"
            d="M533.5 278.4c0-17.4-1.4-34.1-4.1-50.5H272v95.6h146.9c-6.3 33.7-25.2 62.2-53.7 81.2v67h86.9c50.8-46.8 81.4-115.8 81.4-193.3z"
          />
          <path
            fill="#34A853"
            d="M272 544.3c72.6 0 133.5-24.1 178-65.6l-86.9-67c-24.1 16.2-55.1 25.8-91.1 25.8-69.9 0-129.1-47.2-150.2-110.8H32.5v69.7C76.7 474.2 168.3 544.3 272 544.3z"
          />
          <path
            fill="#FBBC05"
            d="M121.8 326.7c-5.4-16.2-8.5-33.5-8.5-51.3s3.1-35.1 8.5-51.3V154.4H32.5C11.8 195.9 0 241.4 0 289.4s11.8 93.5 32.5 135l89.3-97.7z"
          />
          <path
            fill="#EA4335"
            d="M272 107.7c39.5 0 75 13.6 103 40.3l77.3-77.3C405.5 24.2 344.6 0 272 0 168.3 0 76.7 70.1 32.5 154.4l89.3 69.7C142.9 154.9 202.1 107.7 272 107.7z"
          />
        </svg>
        Sign in with Google
      </Button>
    </div>
  );
}
