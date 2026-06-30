"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { checkForNewMessages } from "@/app/actions";

type AutoRefreshProps = {
  intervalMs?: number;
};

export function AutoRefresh({ intervalMs = 30000 }: AutoRefreshProps) {
  const router = useRouter();
  const lastCheck = useRef(Date.now());

  useEffect(() => {
    const check = async () => {
      const { hasNew } = await checkForNewMessages(new Date(lastCheck.current));
      if (hasNew) {
        lastCheck.current = Date.now();
        router.refresh();
      }
    };

    const interval = window.setInterval(check, intervalMs);
    return () => window.clearInterval(interval);
  }, [intervalMs, router]);

  return null;
}
