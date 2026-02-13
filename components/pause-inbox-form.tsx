"use client";

import { useState, useTransition } from "react";
import { pauseInbox, clearInboxPause } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const pauseOptions = [
  { label: "1 hour", hours: 1 },
  { label: "6 hours", hours: 6 },
  { label: "12 hours", hours: 12 },
  { label: "1 day", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "7 days", hours: 168 },
];

type PauseInboxFormProps = {
  isPaused: boolean;
};

export function PauseInboxForm({ isPaused }: PauseInboxFormProps) {
  const [value, setValue] = useState(String(pauseOptions[1].hours));
  const [isPending, startTransition] = useTransition();
  const [isClearing, startClearing] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            await pauseInbox(Number(value));
          });
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <Select value={value} onValueChange={(next) => setValue(next ?? value)}>
          <SelectTrigger className="h-8 w-[140px] rounded-2xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pauseOptions.map((option) => (
              <SelectItem key={option.hours} value={String(option.hours)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Pausing..." : "Pause inbox"}
        </Button>
      </form>
      {isPaused ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            startClearing(async () => {
              await clearInboxPause();
            });
          }}
        >
          <Button type="submit" size="sm" variant="ghost" disabled={isClearing}>
            {isClearing ? "Clearing..." : "Clear pause"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
