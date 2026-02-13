import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "dark:bg-input/30 border-foreground/20 focus-visible:border-foreground/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-9 rounded-2xl border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.86))] px-3 py-1.5 text-base md:text-sm transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_22px_-18px_rgba(15,23,42,0.3)] aria-invalid:ring-3 file:h-6 file:text-base md:file:text-sm file:font-medium aria-invalid:ring-3 file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
