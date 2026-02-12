"use client";

import { useState, useTransition } from "react";
import { reportMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Flag01Icon } from "@hugeicons/core-free-icons";

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
      title={done ? "Reported" : "Report"}
      onClick={() => {
        const reason = window.prompt("Why are you reporting this message?");
        if (!reason) return;
        startTransition(async () => {
          await reportMessage(messageId, reason);
          setDone(true);
        });
      }}
    >
      {done ? "Reported" : isPending ? "Reporting..." : (
        <HugeiconsIcon icon={Flag01Icon} size={18} color="currentColor" strokeWidth={1.5} />
      )}
      <span className="sr-only">Report</span>
    </Button>
  );
}
