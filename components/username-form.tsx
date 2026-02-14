"use client";

import { useState, useTransition } from "react";
import { setUsername } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type UsernameFormProps = {
  initialValue?: string | null;
  submitLabel?: string;
};

export function UsernameForm({
  initialValue,
  submitLabel = "Save username",
}: UsernameFormProps) {
  const [value, setValue] = useState(initialValue ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        setError(null);
        const result = await setUsername(value);
        if (result?.error) {
          setError(result.error);
        }
      } catch (err) {
        setError("Unable to save username.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <label className="kicker block">
          Username
        </label>
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="lowercase_letters"
          className="rounded-2xl"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          3-15 characters. Use letters, numbers, or underscores.
        </p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={isPending || !value.trim()}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
