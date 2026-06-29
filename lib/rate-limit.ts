import type { Duration } from "@upstash/ratelimit";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;

const redis = kvUrl && kvToken
  ? new Redis({ url: kvUrl, token: kvToken })
  : null;

const ratelimits = new Map<string, Ratelimit>();

function getRatelimiter(name: string, tokens: number, window: Duration) {
  if (!ratelimits.has(name)) {
    ratelimits.set(name, new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(tokens, window),
      analytics: true,
      prefix: `ratelimit:${name}`,
    }));
  }
  return ratelimits.get(name)!;
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim()
    || h.get("x-real-ip")
    || "127.0.0.1";
}

export async function checkRateLimit(
  action: string,
  tokens: number,
  window: Duration,
): Promise<{ success: boolean; remaining: number } | null> {
  if (!redis) return null;

  try {
    const limiter = getRatelimiter(action, tokens, window);
    const ip = await getClientIp();
    const result = await limiter.limit(ip);
    return { success: result.success, remaining: result.remaining };
  } catch {
    return null;
  }
}
