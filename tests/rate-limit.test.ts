import { beforeEach, describe, expect, mock, test } from "bun:test";

process.env.KV_REST_API_URL = "https://redis.example.test";
process.env.KV_REST_API_TOKEN = "test-token";

const headersMock = mock(async () => new Headers());
const redisConstructor = mock((_options: any) => {});
const limiterConstructor = mock((_options: any) => {});
const slidingWindow = mock((tokens: number, window: string) => ({ tokens, window }));
const limit = mock(async (_identifier: string) => ({ success: true, remaining: 4 }));

class RedisMock {
  constructor(options: any) {
    redisConstructor(options);
  }
}

class RatelimitMock {
  static slidingWindow = slidingWindow;
  limit = limit;

  constructor(options: any) {
    limiterConstructor(options);
  }
}

mock.module("@upstash/redis", () => ({ Redis: RedisMock }));
mock.module("@upstash/ratelimit", () => ({ Ratelimit: RatelimitMock }));
mock.module("next/headers", () => ({ headers: headersMock }));

const { checkRateLimit } = await import("../lib/rate-limit");

beforeEach(() => {
  headersMock.mockClear();
  headersMock.mockImplementation(async () => new Headers());
  limiterConstructor.mockClear();
  slidingWindow.mockClear();
  limit.mockClear();
  limit.mockImplementation(async () => ({ success: true, remaining: 4 }));
});

describe("rate limiting", () => {
  test("constructs Redis from the configured environment", () => {
    expect(redisConstructor).toHaveBeenCalledWith({
      url: "https://redis.example.test",
      token: "test-token",
    });
  });

  test("creates a sliding-window limiter with an action-specific prefix", async () => {
    await checkRateLimit("first-action", 5, "60 s");

    expect(slidingWindow).toHaveBeenCalledWith(5, "60 s");
    expect(limiterConstructor).toHaveBeenCalledWith(expect.objectContaining({
      analytics: true,
      prefix: "ratelimit:first-action",
      limiter: { tokens: 5, window: "60 s" },
    }));
  });

  test("uses the first forwarded IP when multiple proxies are present", async () => {
    headersMock.mockImplementation(async () => new Headers({
      "x-forwarded-for": " 203.0.113.10, 198.51.100.3, 192.0.2.4 ",
      "x-real-ip": "198.51.100.99",
    }));

    await checkRateLimit("forwarded-ip", 5, "60 s");
    expect(limit).toHaveBeenCalledWith("203.0.113.10");
  });

  test("falls back to x-real-ip when forwarding information is absent", async () => {
    headersMock.mockImplementation(async () => new Headers({
      "x-real-ip": "198.51.100.42",
    }));

    await checkRateLimit("real-ip", 5, "60 s");
    expect(limit).toHaveBeenCalledWith("198.51.100.42");
  });

  test("falls back to localhost when no client IP headers exist", async () => {
    await checkRateLimit("localhost-fallback", 5, "60 s");
    expect(limit).toHaveBeenCalledWith("127.0.0.1");
  });

  test("returns only the public success and remaining fields", async () => {
    limit.mockImplementation(async () => ({
      success: false,
      remaining: 0,
      reset: 123456,
      pending: Promise.resolve(),
    } as any));

    expect(await checkRateLimit("result-shape", 3, "1 m")).toEqual({
      success: false,
      remaining: 0,
    });
  });

  test("reuses a limiter for repeated calls to the same action", async () => {
    await checkRateLimit("cached-action", 5, "60 s");
    await checkRateLimit("cached-action", 5, "60 s");

    const cachedConstructions = limiterConstructor.mock.calls.filter(
      ([options]) => options.prefix === "ratelimit:cached-action",
    );
    expect(cachedConstructions).toHaveLength(1);
    expect(limit).toHaveBeenCalledTimes(2);
  });

  test("creates independent limiters for different action names", async () => {
    await checkRateLimit("action-a", 2, "10 s");
    await checkRateLimit("action-b", 8, "5 m");

    const prefixes = limiterConstructor.mock.calls.map(([options]) => options.prefix);
    expect(prefixes).toContain("ratelimit:action-a");
    expect(prefixes).toContain("ratelimit:action-b");
  });

  test("fails open when reading request headers throws", async () => {
    headersMock.mockImplementation(async () => {
      throw new Error("headers unavailable");
    });

    expect(await checkRateLimit("header-error", 5, "60 s")).toBeNull();
  });

  test("fails open when the rate-limit backend throws", async () => {
    limit.mockImplementation(async () => {
      throw new Error("redis unavailable");
    });

    expect(await checkRateLimit("backend-error", 5, "60 s")).toBeNull();
  });
});
