"use client";

import { useState, useTransition } from "react";
import { updateHiddenWords } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { parseHiddenWordsInput } from "@/lib/hidden-words";

type HiddenWordsFormProps = {
  initialValue: string[];
};

export function HiddenWordsForm({ initialValue }: HiddenWordsFormProps) {
  const [value, setValue] = useState(initialValue.join("\n"));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          try {
            setError(null);
            const result = await updateHiddenWords(parseHiddenWordsInput(value));
            if (result.success) {
              toast("Saved.");
            } else {
              setError(result.message || "Unable to save hidden words.");
            }
          } catch (err) {
            setError("Unable to save hidden words.");
          }
        });
      }}
    >
      <div className="space-y-4">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="mt-1 min-h-[150px] bg-white/30 dark:bg-black/15 backdrop-blur-[6px] border border-black/10 dark:border-white/10 hover:bg-white/40 dark:hover:bg-black/25 focus-visible:bg-white/50 dark:focus-visible:bg-black/35 focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-primary/25 transition-all duration-200"
          placeholder="Enter words or phrases, one per line"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Messages containing these words won&apos;t be delivered. Separate with
          commas or new lines.
        </p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
