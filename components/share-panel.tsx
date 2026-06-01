"use client";

import { useState } from "react";
import { ReactQRCode } from "@lglab/react-qr-code";
import { useAccentTheme } from "@/components/accent-theme-provider";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link01Icon, QrCode01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

type SharePanelProps = {
  url: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
};

export function SharePanel({ url, className, orientation = "horizontal" }: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const { accentTheme } = useAccentTheme();

  const getQrColor = () => {
    switch (accentTheme) {
      case "sage":
        return "#4e9f73";
      case "rose":
        return "#e56b6f";
      case "sky":
      default:
        return "#00b9ff";
    }
  };

  const qrColor = getQrColor();

  return (
    <div className={cn("panel-card p-6 sm:p-7", className)}>
      <div className="flex items-center justify-between gap-3 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
        <span>Share your link</span>
        <span className="hidden text-[0.55rem] text-muted-foreground/80 md:inline">
          Scan or copy
        </span>
      </div>
      <div className={cn(
        "mt-4 gap-4",
        orientation === "horizontal" ? "grid md:grid-cols-[1fr_auto]" : "flex flex-col"
      )}>
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
        <div className={cn(
          "panel-card-muted flex items-center justify-center p-3 md:min-w-[240px] shrink-0",
          orientation === "vertical" && "w-fit self-center px-6"
        )}>
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
            <div className="rounded-xl border border-white/20 bg-white p-3 shadow-sm select-none">
              <ReactQRCode
                value={url}
                size={140}
                marginSize={1}
                background="#ffffff"
                dataModulesSettings={{
                  style: "rounded",
                  size: 0.9,
                  color: qrColor,
                }}
                finderPatternOuterSettings={{
                  style: "rounded-lg",
                  color: qrColor,
                }}
                finderPatternInnerSettings={{
                  style: "rounded",
                  color: qrColor,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Scan to open.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
