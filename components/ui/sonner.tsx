"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";

export function Toaster({ className, ...props }: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      toastOptions={{
        style: {
          boxShadow: "none",
          backdropFilter: "none",
          filter: "none",
        },
        classNames: {
          toast: cn(
            "bg-background text-foreground border border-foreground/40 rounded-xl",
            "shadow-none backdrop-blur-none ring-0",
          ),
          title: "text-sm font-medium",
          description: "text-xs text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-foreground",
        },
      }}
      className={cn("toaster group", className)}
      {...props}
    />
  );
}
