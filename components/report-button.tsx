"use client";

import { useState, useTransition } from "react";
import { reportMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";

type ReportButtonProps = {
  messageId: string;
};

export function ReportButton({ messageId }: ReportButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <Button
      variant="ghost"
      size="xs"
      disabled={isPending || done}
      onClick={() => {
        const reason = window.prompt("Why are you reporting this message?");
        if (!reason) return;
        startTransition(async () => {
          await reportMessage(messageId, reason);
          setDone(true);
        });
      }}
    >
      {done ? "Reported" : isPending ? "Reporting..." : "Report"}
    </Button>
  );
}
