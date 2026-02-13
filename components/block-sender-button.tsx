"use client";

import { useState, useTransition } from "react";
import { blockSender } from "@/app/actions";
import { Button } from "@/components/ui/button";

type BlockSenderButtonProps = {
  messageId: string;
  recipientUsername: string;
};

export function BlockSenderButton({
  messageId,
  recipientUsername,
}: BlockSenderButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      disabled={isPending || done}
      title={done ? "Blocked" : "Block sender"}
      onClick={() => {
        startTransition(async () => {
          await blockSender(messageId, recipientUsername);
          setDone(true);
        });
      }}
    >
      {done ? "Blocked" : "Block"}
      <span className="sr-only">Block sender</span>
    </Button>
  );
}
