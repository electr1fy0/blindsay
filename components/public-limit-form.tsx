"use client";

import { useState, useTransition } from "react";
import { updatePublicReplyLimit } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PublicLimitFormProps = {
  initialValue: number;
};

export function PublicLimitForm({ initialValue }: PublicLimitFormProps) {
  const [value, setValue] = useState(String(initialValue));
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          await updatePublicReplyLimit(Number(value));
        });
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <Select value={value} onValueChange={(next) => setValue(next ?? value)}>
        <SelectTrigger className="h-8 w-[120px] rounded-2xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[5, 10, 15, 20, 30, 40, 50].map((limit) => (
            <SelectItem key={limit} value={String(limit)}>
              {limit}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
