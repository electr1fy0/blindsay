"use client";

import { useState, useTransition } from "react";
import { unblockSender } from "@/app/actions";
import { Button } from "@/components/ui/button";

type UnblockSenderButtonProps = {
  blockId: string;
};

export function UnblockSenderButton({ blockId }: UnblockSenderButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      disabled={isPending || done}
      title={done ? "Unblocked" : "Unblock"}
      onClick={() => {
        startTransition(async () => {
          await unblockSender(blockId);
          setDone(true);
        });
      }}
    >
      {done ? "Unblocked" : "Unblock"}
    </Button>
  );
}
