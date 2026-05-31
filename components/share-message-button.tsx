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
  className?: string;
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

function bubblePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: {
    tl: number;
    tr: number;
    br: number;
    bl: number;
  },
) {
  ctx.beginPath();
  ctx.moveTo(x + radii.tl, y);
  ctx.lineTo(x + w - radii.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radii.tr);
  ctx.lineTo(x + w, y + h - radii.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radii.br, y + h);
  ctx.lineTo(x + radii.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radii.bl);
  ctx.lineTo(x, y + radii.tl);
  ctx.quadraticCurveTo(x, y, x + radii.tl, y);
  ctx.closePath();
}

const MONO =
  '"Geist Mono", "SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace';

const COLORS = {
  bg1: "#efeff0",
  bg2: "#e7e7e8",
  cardHighlight: "#f8f8f9",
  cardSurface: "#f2f2f3",
  cardBorder: "rgba(255,255,255,0.7)",
  cardShadow: "rgba(15,23,42,0.10)",
  cardInnerTop: "rgba(255,255,255,0.9)",
  cardInnerLeft: "rgba(255,255,255,0.55)",
  cardInnerRight: "rgba(15,23,42,0.06)",
  cardInnerBottom: "rgba(15,23,42,0.08)",
  overlayTop: "rgba(255,255,255,0.80)",
  overlayBottom: "rgba(255,255,255,0.0)",
  subtleHighlight: "rgba(255,255,255,0.96)",
  subtleSurface: "rgba(255,255,255,0.82)",
  subtleBorder: "rgba(255,255,255,0.7)",
  subtleInnerTop: "rgba(255,255,255,0.9)",
  subtleInnerLeft: "rgba(255,255,255,0.55)",
  subtleInnerRight: "rgba(15,23,42,0.05)",
  subtleInnerBottom: "rgba(15,23,42,0.06)",
  subtleOverlayTop: "rgba(255,255,255,0.75)",
  subtleOverlayBottom: "rgba(255,255,255,0.0)",
  foreground: "#2e2e2e",
  muted: "#929292",
  brand: "#b0b0b5",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawPanelCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.save();
  ctx.shadowColor = COLORS.cardShadow;
  ctx.shadowBlur = 36;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 16;
  const bg = ctx.createLinearGradient(x, y, x, y + h);
  bg.addColorStop(0, COLORS.cardHighlight);
  bg.addColorStop(1, COLORS.cardSurface);
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();

  roundRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = COLORS.cardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  const overlay = ctx.createLinearGradient(x, y, x, y + h);
  overlay.addColorStop(0, COLORS.overlayTop);
  overlay.addColorStop(1, COLORS.overlayBottom);
  ctx.globalAlpha = 0.65;
  ctx.fillStyle = overlay;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  const ir = Math.max(0, r - 2);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + 1 + ir, y + 1);
  ctx.lineTo(x + w - 1 - ir, y + 1);
  ctx.quadraticCurveTo(x + w - 1, y + 1, x + w - 1, y + 1 + ir);
  ctx.strokeStyle = COLORS.cardInnerTop;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 1, y + 1 + ir);
  ctx.lineTo(x + 1, y + h - 1 - ir);
  ctx.strokeStyle = COLORS.cardInnerLeft;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w - 1, y + 1 + ir);
  ctx.lineTo(x + w - 1, y + h - 1 - ir);
  ctx.strokeStyle = COLORS.cardInnerRight;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 1 + ir, y + h - 1);
  ctx.lineTo(x + w - 1 - ir, y + h - 1);
  ctx.strokeStyle = COLORS.cardInnerBottom;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawBubbleCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  side: "left" | "right",
) {
  const radii =
    side === "left"
      ? { tl: 18, tr: 18, br: 18, bl: 6 }
      : { tl: 18, tr: 18, br: 6, bl: 18 };

  ctx.save();
  ctx.shadowColor = "rgba(15,23,42,0.06)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;
  const bg = ctx.createLinearGradient(x, y, x, y + h);
  bg.addColorStop(0, COLORS.subtleHighlight);
  bg.addColorStop(1, COLORS.subtleSurface);
  bubblePath(ctx, x, y, w, h, radii);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();

  bubblePath(ctx, x, y, w, h, radii);
  ctx.strokeStyle = COLORS.subtleBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.save();
  bubblePath(ctx, x, y, w, h, radii);
  ctx.clip();
  const overlay = ctx.createLinearGradient(x, y, x, y + h);
  overlay.addColorStop(0, COLORS.subtleOverlayTop);
  overlay.addColorStop(1, COLORS.subtleOverlayBottom);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = overlay;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

async function generateCardCanvas(
  messageContent: string,
  replyContent: string,
  username: string,
  logoImg: HTMLImageElement | null,
): Promise<HTMLCanvasElement> {
  const scale = 4;
  const outerPad = 32;
  const cardW = 480;
  const totalW = cardW + outerPad * 2;
  const pad = 28;
  const contentW = cardW - pad * 2;

  const tmp = document.createElement("canvas").getContext("2d")!;

  tmp.font = `400 ${13 * scale}px ${MONO}`;
  const msgLines = wrapText(tmp, messageContent, contentW * scale);

  tmp.font = `400 ${12.5 * scale}px ${MONO}`;
  const replyContentW = contentW - 40;
  const replyLines = wrapText(tmp, replyContent, replyContentW * scale);

  const msgLineH = 21;
  const msgPadV = 16;
  const msgPadH = 18;
  const replyLineH = 20;
  const msgTextH = msgLines.length * msgLineH;
  const replyTextH = replyLines.length * replyLineH;

  const kickerH = 24;
  const replyKickerH = 24;
  const replyPadV = 14;
  const replyPadH = 18;
  const msgBoxW = contentW - 32;
  const msgBoxH = kickerH + msgTextH + msgPadV * 2;
  const replyBoxW = contentW;
  const replyBoxH = replyKickerH + replyTextH + replyPadV * 2;
  const brandRowH = 32;
  const sectionGap = 16;

  const cardInnerH =
    pad +
    msgBoxH +
    sectionGap +
    replyBoxH +
    sectionGap +
    brandRowH +
    pad;
  const totalH = cardInnerH + outerPad * 2;

  const canvas = document.createElement("canvas");
  canvas.width = totalW * scale;
  canvas.height = totalH * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  const bodyBg = ctx.createLinearGradient(0, 0, 0, totalH);
  bodyBg.addColorStop(0, COLORS.bg1);
  bodyBg.addColorStop(1, COLORS.bg2);
  ctx.fillStyle = bodyBg;
  ctx.fillRect(0, 0, totalW, totalH);

  ctx.save();
  ctx.globalAlpha = 0.4;
  const r1 = ctx.createRadialGradient(
    totalW * 0.2,
    totalH * 0.12,
    0,
    totalW * 0.2,
    totalH * 0.12,
    totalW * 0.5,
  );
  r1.addColorStop(0, "#fafafa");
  r1.addColorStop(1, "transparent");
  ctx.fillStyle = r1;
  ctx.fillRect(0, 0, totalW, totalH);

  const r2 = ctx.createRadialGradient(
    totalW * 0.8,
    totalH * 0.18,
    0,
    totalW * 0.8,
    totalH * 0.18,
    totalW * 0.45,
  );
  r2.addColorStop(0, "#f4f4f5");
  r2.addColorStop(1, "transparent");
  ctx.fillStyle = r2;
  ctx.fillRect(0, 0, totalW, totalH);
  ctx.restore();

  const cardX = outerPad;
  const cardY = outerPad;
  const cardR = 24;

  drawPanelCard(ctx, cardX, cardY, cardW, cardInnerH, cardR);

  let y = cardY + pad;
  const textX = cardX + pad;

  ctx.textBaseline = "top";

  const msgBoxX = cardX + pad;
  const msgBoxY = y;
  drawBubbleCard(ctx, msgBoxX, msgBoxY, msgBoxW, msgBoxH, "left");

  const msgTextX = msgBoxX + msgPadH;
  y = msgBoxY + msgPadV;
  ctx.font = `500 9px ${MONO}`;
  ctx.fillStyle = COLORS.muted;
  ctx.letterSpacing = "2.2px";
  ctx.fillText("ANONYMOUS MESSAGE", msgTextX, y);
  ctx.letterSpacing = "0px";
  y += kickerH;

  ctx.font = `400 13px ${MONO}`;
  ctx.fillStyle = COLORS.foreground;
  for (const line of msgLines) {
    ctx.fillText(line, msgTextX + 2, y);
    y += msgLineH;
  }

  y = msgBoxY + msgBoxH + sectionGap;

  const replyBoxX = cardX + pad;
  const replyBoxY = y;

  drawBubbleCard(ctx, replyBoxX, replyBoxY, replyBoxW, replyBoxH, "right");

  const rTextX = replyBoxX + replyPadH;
  y = replyBoxY + replyPadV;

  ctx.font = `500 9px ${MONO}`;
  ctx.fillStyle = COLORS.muted;
  ctx.letterSpacing = "2.2px";
  ctx.fillText("REPLY", rTextX, y);
  ctx.letterSpacing = "0px";
  y += replyKickerH;

  ctx.font = `400 12.5px ${MONO}`;
  ctx.fillStyle = COLORS.foreground;
  for (const line of replyLines) {
    ctx.fillText(line, rTextX + 2, y);
    y += replyLineH;
  }

  const brandY = cardY + cardInnerH - pad - brandRowH + 10;
  const logoSize = 20;

  ctx.font = `400 10px ${MONO}`;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(`@${username}`, textX, brandY + 5);

  if (logoImg) {
    const logoX = cardX + cardW - pad - logoSize - 68;
    const logoY = brandY;

    ctx.save();
    roundRect(ctx, logoX, logoY, logoSize, logoSize, 5);
    ctx.clip();
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    ctx.restore();

    ctx.font = `500 10px ${MONO}`;
    ctx.fillStyle = COLORS.brand;
    ctx.letterSpacing = "0.8px";
    ctx.fillText("BLINDSAY", logoX + logoSize + 6, logoY + 5);
    ctx.letterSpacing = "0px";
  } else {
    ctx.font = `500 10px ${MONO}`;
    ctx.fillStyle = COLORS.brand;
    ctx.letterSpacing = "0.8px";
    const brand = "BLINDSAY";
    const brandW = ctx.measureText(brand).width;
    ctx.fillText(brand, cardX + cardW - pad - brandW, brandY + 5);
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
  className,
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
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent,
      );
      const canUseClipboard =
        !isIOSSafari() &&
        typeof ClipboardItem !== "undefined" &&
        !!navigator.clipboard?.write;

      if (canUseClipboard) {
        // Pass a Promise to ClipboardItem so the write happens within the
        // user-gesture context — required for Safari desktop.
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": generateCardCanvas(
                messageContent,
                replyContent,
                username,
                logoRef.current,
              ).then(
                (c) =>
                  new Promise<Blob>((resolve, reject) =>
                    c.toBlob(
                      (b) => (b ? resolve(b) : reject(new Error("no blob"))),
                      "image/png",
                    ),
                  ),
              ),
            }),
          ]);
          toast("Card copied to clipboard, paste it anywhere!");
          return;
        } catch {
          // fall through
        }
      }

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
        isMobile &&
        typeof navigator.share === "function" &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({ files: [file] });
        toast("Shared!");
        return;
      }

      downloadCanvas(canvas, username);
      toast("Card downloaded!");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error(err);
      toast.error("Failed to create share card.");
    } finally {
      setBusy(false);
    }
  }, [messageContent, replyContent, username]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      title="Share card"
      disabled={busy}
      onClick={handleShare}
      className={className}
    >
      {busy ? (
        "…"
      ) : (
        <HugeiconsIcon
          icon={Share08Icon}
          size={14}
          color="currentColor"
          strokeWidth={1.5}
        />
      )}
      <span className="sr-only">Share</span>
    </Button>
  );
}
