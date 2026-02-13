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
  { label: "24 hours", hours: 24 },
  { label: "72 hours", hours: 72 },
  { label: "168 hours", hours: 168 },
];

type PauseInboxFormProps = {
  isPaused: boolean;
};

export function PauseInboxForm({ isPaused }: PauseInboxFormProps) {
  const [value, setValue] = useState(String(pauseOptions[1].hours));
  const [isPending, startTransition] = useTransition();
  const [isClearing, startClearing] = useTransition();

  if (isPaused) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          startClearing(async () => {
            await clearInboxPause();
          });
        }}
      >
        <Button type="submit" size="sm" variant="outline" disabled={isClearing}>
          {isClearing ? "Resuming..." : "Resume"}
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-nowrap items-center gap-2">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            await pauseInbox(Number(value));
          });
        }}
        className="flex flex-nowrap items-center gap-2"
      >
        <Select value={value} onValueChange={(next) => setValue(next ?? value)}>
          <SelectTrigger className="h-8 w-[110px] rounded-2xl">
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
          {isPending ? "Pausing..." : "Pause"}
        </Button>
      </form>
    </div>
  );
}
