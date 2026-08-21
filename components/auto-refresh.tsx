"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { checkForNewMessages } from "@/app/actions";
import { runAutoRefreshCheck } from "@/lib/auto-refresh";

type AutoRefreshProps = {
  intervalMs?: number;
};

export function AutoRefresh({ intervalMs = 60000 }: AutoRefreshProps) {
  const router = useRouter();
  const lastCheck = useRef<number | null>(null);
  const checking = useRef(false);

  useEffect(() => {
    lastCheck.current = Date.now();
  }, []);

  useEffect(() => {
    const check = async () => {
      if (checking.current) return;
      checking.current = true;
      try {
        lastCheck.current = await runAutoRefreshCheck({
          hidden: document.hidden,
          lastCheck: lastCheck.current,
          checkForNewMessages,
          refresh: router.refresh,
        });
      } finally {
        checking.current = false;
      }
    };

    const interval = window.setInterval(check, intervalMs);
    return () => window.clearInterval(interval);
  }, [intervalMs, router]);

  return null;
}
