import { describe, expect, test } from "bun:test";
import { getBaseUrl, getProfileUrl, normalizeSiteUrl } from "../lib/site-url";

describe("normalizeSiteUrl", () => {
  test.each([
    [undefined, null],
    [null, null],
    ["", null],
    ["   ", null],
    ["https://blindsay.example", "https://blindsay.example"],
    ["https://blindsay.example/", "https://blindsay.example"],
    ["https://blindsay.example////", "https://blindsay.example"],
    [" http://example.test/path/ ", "http://example.test/path"],
    ["blindsay.example", "https://blindsay.example"],
    ["BLINDSAY.EXAMPLE/", "https://BLINDSAY.EXAMPLE"],
    ["localhost:3000", "http://localhost:3000"],
    ["localhost:3000/", "http://localhost:3000"],
    ["127.0.0.1:4000/", "http://127.0.0.1:4000"],
    ["[::1]:3000/", "http://[::1]:3000"],
    ["HTTP://example.test/", "HTTP://example.test"],
    ["HTTPS://example.test/", "HTTPS://example.test"],
  ])("normalizes %p to %p", (input, expected) => {
    expect(normalizeSiteUrl(input as any)).toBe(expected);
  });
});

describe("getBaseUrl", () => {
  test("prefers NEXT_PUBLIC_SITE_URL over VERCEL_URL", () => {
    expect(
      getBaseUrl({
        NEXT_PUBLIC_SITE_URL: "https://public.example/",
        VERCEL_URL: "preview.vercel.app",
      }),
    ).toBe("https://public.example");
  });

  test("treats an empty public URL as absent", () => {
    expect(
      getBaseUrl({
        NEXT_PUBLIC_SITE_URL: "   ",
        VERCEL_URL: "preview.vercel.app/",
      }),
    ).toBe("https://preview.vercel.app");
  });

  test("accepts a Vercel URL that already includes a protocol", () => {
    expect(getBaseUrl({ VERCEL_URL: "https://preview.vercel.app/" })).toBe(
      "https://preview.vercel.app",
    );
  });

  test("falls back to localhost with no configured URL", () => {
    expect(getBaseUrl({})).toBe("http://localhost:3000");
  });
});

describe("getProfileUrl", () => {
  test("never creates a double slash between origin and username", () => {
    expect(
      getProfileUrl("alice", {
        NEXT_PUBLIC_SITE_URL: "https://blindsay.example////",
      }),
    ).toBe("https://blindsay.example/alice");
  });

  test("preserves an already-normalized username path segment", () => {
    expect(getProfileUrl("alice_123", {})).toBe(
      "http://localhost:3000/alice_123",
    );
  });
});
