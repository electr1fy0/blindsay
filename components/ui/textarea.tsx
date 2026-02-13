import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-white/80 dark:bg-input/30 focus-visible:border-white focus-visible:ring-white/60 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 rounded-2xl border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.86))] px-3 py-2 text-base md:text-sm transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_22px_-18px_rgba(15,23,42,0.3)] focus-visible:ring-3 aria-invalid:ring-3 placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full resize-none outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
