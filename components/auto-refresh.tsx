"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AutoRefreshProps = {
  intervalMs?: number;
};

export function AutoRefresh({ intervalMs = 8000 }: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    let isRefreshing = false;

    const refresh = () => {
      if (document.visibilityState !== "visible" || isRefreshing) {
        return;
      }

      isRefreshing = true;
      router.refresh();
      window.setTimeout(() => {
        isRefreshing = false;
      }, 500);
    };

    const interval = window.setInterval(refresh, intervalMs);
    window.addEventListener("focus", refresh);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [intervalMs, router]);

  return null;
}
