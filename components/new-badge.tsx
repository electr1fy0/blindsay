"use client";

import { useEffect } from "react";

const STORAGE_KEY = "blindsay:seen";

let cachedSeenIds: Set<string> | null = null;

function getSeenIds(): Set<string> {
  if (cachedSeenIds) return cachedSeenIds;
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    cachedSeenIds = new Set(JSON.parse(raw));
    return cachedSeenIds;
  } catch {
    return new Set();
  }
}

function markSeen(ids: string[]) {
  if (typeof window === "undefined") return;
  cachedSeenIds = null;
  const seen = getSeenIds();
  for (const id of ids) seen.add(id);
  try {
    const arr = [...seen];
    if (arr.length > 500) arr.splice(0, arr.length - 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
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
  useEffect(() => {
    if (messageIds.length > 0) {
      const timer = setTimeout(() => markSeen(messageIds), 100);
      return () => clearTimeout(timer);
    }
  }, [messageIds]);

  return null;
}
