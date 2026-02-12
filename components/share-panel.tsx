"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SharePanelProps = {
  url: string;
};

export function SharePanel({ url }: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 160 }).then(setQr);
  }, [url]);

  return (
    <div className="rounded-2xl border border-foreground/10 bg-card/90 p-4">
      <div className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
        Share your link
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input value={url} readOnly className="h-9 rounded-2xl" />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        {qr ? (
          <div className="rounded-2xl border border-foreground/10 bg-background/80 p-3">
            <img src={qr} alt="QR code" className="h-40 w-40" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
