"use client";

import { useEffect } from "react";
import {
  mergeSeenMessageIds,
  parseSeenMessageIds,
} from "@/lib/seen-messages";

const STORAGE_KEY = "blindsay:seen";

let cachedSeenIds: Set<string> | null = null;

function getSeenIds(): Set<string> {
  if (cachedSeenIds) return cachedSeenIds;
  if (typeof window === "undefined") return new Set();
  try {
    cachedSeenIds = new Set(
      parseSeenMessageIds(localStorage.getItem(STORAGE_KEY)),
    );
    return cachedSeenIds;
  } catch {
    cachedSeenIds = new Set();
    return cachedSeenIds;
  }
}

function markSeen(ids: string[]) {
  if (typeof window === "undefined") return;

  const merged = mergeSeenMessageIds(getSeenIds(), ids);
  cachedSeenIds = new Set(merged);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {}
}

export function NewBadge({ messageId }: { messageId: string }) {
  const isNew = !getSeenIds().has(messageId);

  if (!isNew) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-primary/15 backdrop-blur-xs border border-primary/20 px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wider text-primary shadow-3xs">
      new
    </span>
  );
}

export function MarkMessagesSeen({ messageIds }: { messageIds: string[] }) {
  const key = messageIds.join(",");

  useEffect(() => {
    if (messageIds.length > 0) {
      const timer = setTimeout(() => markSeen(messageIds), 100);
      return () => clearTimeout(timer);
    }
  }, [key]);

  return null;
}
