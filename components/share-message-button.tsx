"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Share08Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

type ShareMessageButtonProps = {
  messageContent: string;
  replyContent: string;
  username: string;
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph === "") {
      lines.push("");
      continue;
    }
    const words = paragraph.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
  }

  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const MONO =
  '"Geist Mono", "SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function generateCardCanvas(
  messageContent: string,
  replyContent: string,
  username: string,
  logoImg: HTMLImageElement | null,
): Promise<HTMLCanvasElement> {
  const scale = 2;
  const cardW = 520;
  const pad = 36;
  const contentW = cardW - pad * 2;

  const tmp = document.createElement("canvas").getContext("2d")!;

  tmp.font = `400 ${14 * scale}px ${MONO}`;
  const msgLines = wrapText(tmp, messageContent, contentW * scale);

  tmp.font = `400 ${13 * scale}px ${MONO}`;
  const replyW = contentW - 28;
  const replyLines = wrapText(tmp, replyContent, replyW * scale);

  const msgLineH = 22;
  const replyLineH = 21;
  const msgTextH = msgLines.length * msgLineH;
  const replyTextH = replyLines.length * replyLineH;

  const labelH = 30;
  const replyLabelH = 26;
  const replyPad = 16;
  const replyBoxH = replyLabelH + replyTextH + replyPad * 2;
  const brandH = 40;
  const gap = 14;

  const cardH = pad + labelH + msgTextH + gap + replyBoxH + gap + brandH + pad;

  const canvas = document.createElement("canvas");
  canvas.width = cardW * scale;
  canvas.height = cardH * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  const bg = ctx.createLinearGradient(0, 0, 0, cardH);
  bg.addColorStop(0, "#f9fbff");
  bg.addColorStop(1, "#edf1fb");

  roundRect(ctx, 0, 0, cardW, cardH, 22);
  ctx.fillStyle = bg;
  ctx.fill();

  roundRect(ctx, 0.5, 0.5, cardW - 1, cardH - 1, 22);
  ctx.strokeStyle = "rgba(59,109,255,0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();

  roundRect(ctx, 1.5, 1.5, cardW - 3, cardH - 3, 21);
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 1;
  ctx.stroke();

  let y = pad;

  ctx.font = `600 9px ${MONO}`;
  ctx.fillStyle = "#8b8fa3";
  ctx.textBaseline = "top";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("ANONYMOUS MESSAGE", pad, y);
  ctx.letterSpacing = "0px";
  y += labelH;

  ctx.font = `400 14px ${MONO}`;
  ctx.fillStyle = "#1a1d2e";
  for (const line of msgLines) {
    ctx.fillText(line, pad + 2, y);
    y += msgLineH;
  }

  y += gap;

  const rBoxX = pad - 6;
  const rBoxW = contentW + 12;
  const rBoxY = y;

  const rBg = ctx.createLinearGradient(0, rBoxY, 0, rBoxY + replyBoxH);
  rBg.addColorStop(0, "rgba(255,255,255,0.97)");
  rBg.addColorStop(1, "rgba(255,255,255,0.86)");

  roundRect(ctx, rBoxX, rBoxY, rBoxW, replyBoxH, 14);
  ctx.fillStyle = rBg;
  ctx.fill();

  roundRect(ctx, rBoxX + 0.5, rBoxY + 0.5, rBoxW - 1, replyBoxH - 1, 14);
  ctx.strokeStyle = "rgba(59,109,255,0.06)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const rContentX = pad + 8;
  y = rBoxY + replyPad;

  ctx.font = `600 9px ${MONO}`;
  ctx.fillStyle = "#8b8fa3";
  ctx.letterSpacing = "1.5px";
  const replyLabel = "REPLY";
  ctx.fillText(replyLabel, rContentX, y);
  const labelWidth = ctx.measureText(replyLabel).width;
  ctx.letterSpacing = "0px";

  ctx.font = `400 9px ${MONO}`;
  ctx.fillText(`  ·  @${username}`, rContentX + labelWidth, y);
  y += replyLabelH;

  ctx.font = `400 13px ${MONO}`;
  ctx.fillStyle = "#1a1d2e";
  for (const line of replyLines) {
    ctx.fillText(line, rContentX + 2, y);
    y += replyLineH;
  }

  const brandY = cardH - pad - 6;
  const logoSize = 22;

  if (logoImg) {
    ctx.save();
    roundRect(
      ctx,
      cardW - pad - logoSize - 70,
      brandY - logoSize + 6,
      logoSize,
      logoSize,
      4,
    );
    ctx.clip();
    ctx.drawImage(
      logoImg,
      cardW - pad - logoSize - 70,
      brandY - logoSize + 6,
      logoSize,
      logoSize,
    );
    ctx.restore();

    ctx.font = `500 11px ${MONO}`;
    ctx.fillStyle = "#b0b4c8";
    ctx.letterSpacing = "0.5px";
    ctx.fillText("BLINDSAY", cardW - pad - 65, brandY - logoSize + 12);
    ctx.letterSpacing = "0px";
  } else {
    ctx.font = `500 11px ${MONO}`;
    ctx.fillStyle = "#b0b4c8";
    ctx.letterSpacing = "0.5px";
    const brand = "BLINDSAY";
    const brandW = ctx.measureText(brand).width;
    ctx.fillText(brand, cardW - pad - brandW, brandY - 4);
    ctx.letterSpacing = "0px";
  }

  return canvas;
}

function downloadCanvas(canvas: HTMLCanvasElement, username: string) {
  const a = document.createElement("a");
  a.download = `blindsay-${username}-${Date.now()}.png`;
  a.href = canvas.toDataURL("image/png");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  return isIOS && isSafari;
}

export function ShareMessageButton({
  messageContent,
  replyContent,
  username,
}: ShareMessageButtonProps) {
  const [busy, setBusy] = useState(false);
  const logoRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    loadImage("/blindsay.png")
      .then((img) => {
        logoRef.current = img;
      })
      .catch(() => {});
  }, []);

  const handleShare = useCallback(async () => {
    setBusy(true);
    try {
      const canvas = await generateCardCanvas(
        messageContent,
        replyContent,
        username,
        logoRef.current,
      );
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("no blob"))),
          "image/png",
        ),
      );

      const file = new File([blob], "blindsay.png", { type: "image/png" });

      if (
        typeof navigator.share === "function" &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({ files: [file] });
        toast("Shared!");
        return;
      }

      if (
        !isIOSSafari() &&
        typeof ClipboardItem !== "undefined" &&
        navigator.clipboard?.write
      ) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          toast("Card copied to clipboard — paste it anywhere!");
          return;
        } catch {
          // fall through to download
        }
      }

      downloadCanvas(canvas, username);
      toast("Card downloaded!");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error(err);
      try {
        const canvas = await generateCardCanvas(
          messageContent,
          replyContent,
          username,
          logoRef.current,
        );
        downloadCanvas(canvas, username);
        toast("Card downloaded!");
      } catch {
        toast.error("Failed to create share card.");
      }
    } finally {
      setBusy(false);
    }
  }, [messageContent, replyContent, username]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      title="Share card"
      disabled={busy}
      onClick={handleShare}
    >
      {busy ? (
        "…"
      ) : (
        <HugeiconsIcon
          icon={Share08Icon}
          size={18}
          color="currentColor"
          strokeWidth={1.5}
        />
      )}
      <span className="sr-only">Share</span>
    </Button>
  );
}
