"use client";

import { useState, useTransition } from "react";
import { updateHiddenWords } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type HiddenWordsFormProps = {
  initialValue: string[];
};

function parseHiddenWords(raw: string) {
  return raw
    .split(/\n|,/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0);
}

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
            const result = await updateHiddenWords(parseHiddenWords(value));
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
          className="min-h-[150px] rounded-2xl mt-1"
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
