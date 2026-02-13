"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link01Icon, QrCode01Icon } from "@hugeicons/core-free-icons";

type SharePanelProps = {
  url: string;
};

export function SharePanel({ url }: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(url, {
      margin: 1,
      width: 180,
      color: { dark: "#0b0f1a", light: "#ffffff" },
    }).then(setQr);
  }, [url]);

  return (
    <div className="panel-card p-4">
      <div className="flex items-center justify-between gap-3 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
        <span>Share your link</span>
        <span className="hidden text-[0.55rem] text-muted-foreground/80 md:inline">
          Scan or copy
        </span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
        <div className="flex flex-col gap-3">
          <div className="panel-card-muted px-3 py-2 text-sm text-foreground/80">
            <span className="break-all">{url}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
            >
              <HugeiconsIcon
                icon={Link01Icon}
                size={18}
                color="currentColor"
                strokeWidth={1.5}
              />
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        </div>
        <div className="panel-card-muted flex items-center justify-center p-3">
          {qr ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                <HugeiconsIcon
                  icon={QrCode01Icon}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                QR
              </div>
              <div className="rounded-2xl border border-foreground/10 bg-white p-3">
                <img src={qr} alt="QR code" className="h-36 w-36" />
              </div>
              <p className="text-xs text-muted-foreground">Scan to open.</p>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Generating…</div>
          )}
        </div>
      </div>
    </div>
  );
}
