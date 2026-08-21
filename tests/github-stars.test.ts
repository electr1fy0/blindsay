import { describe, expect, mock, test } from "bun:test";
import {
  fetchGitHubStarCount,
  formatGitHubStarCount,
  parseGitHubStarCount,
} from "../lib/github-stars";

describe("parseGitHubStarCount", () => {
  test.each([
    [null, null],
    [undefined, null],
    ["bad", null],
    [42, null],
    [{}, null],
    [{ stargazers_count: null }, null],
    [{ stargazers_count: "12" }, null],
    [{ stargazers_count: NaN }, null],
    [{ stargazers_count: Infinity }, null],
    [{ stargazers_count: -1 }, null],
    [{ stargazers_count: 0 }, 0],
    [{ stargazers_count: 999 }, 999],
    [{ stargazers_count: 12.9 }, 12],
  ])("parses %p", (input, expected) => {
    expect(parseGitHubStarCount(input)).toBe(expected);
  });
});

describe("formatGitHubStarCount", () => {
  test.each([
    [null, null],
    [NaN, null],
    [Infinity, null],
    [-1, null],
    [0, "0"],
    [1, "1"],
    [999, "999"],
    [999.9, "999"],
    [1000, "1.0k"],
    [1499, "1.5k"],
    [10_000, "10.0k"],
  ])("formats %p as %p", (input, expected) => {
    expect(formatGitHubStarCount(input as number | null)).toBe(expected);
  });
});

describe("fetchGitHubStarCount", () => {
  test("uses the GitHub API with one-hour Next.js revalidation", async () => {
    const fetcher = mock(async () => ({
      ok: true,
      json: async () => ({ stargazers_count: 123 }),
    }));

    expect(await fetchGitHubStarCount(fetcher as any)).toBe(123);
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.github.com/repos/electr1fy0/blindsay",
      {
        next: { revalidate: 3600 },
        headers: { Accept: "application/vnd.github+json" },
      },
    );
  });

  test("returns null for non-ok responses without parsing the body", async () => {
    const json = mock(async () => ({ stargazers_count: 999 }));
    const fetcher = mock(async () => ({ ok: false, json }));

    expect(await fetchGitHubStarCount(fetcher as any)).toBeNull();
    expect(json).not.toHaveBeenCalled();
  });

  test("returns null when fetch rejects", async () => {
    const fetcher = mock(async () => {
      throw new Error("network down");
    });
    expect(await fetchGitHubStarCount(fetcher as any)).toBeNull();
  });

  test("returns null when an ok response contains invalid JSON", async () => {
    const fetcher = mock(async () => ({
      ok: true,
      json: async () => {
        throw new SyntaxError("bad json");
      },
    }));
    expect(await fetchGitHubStarCount(fetcher as any)).toBeNull();
  });

  test("returns null for an invalid star-count payload", async () => {
    const fetcher = mock(async () => ({
      ok: true,
      json: async () => ({ stargazers_count: "a lot" }),
    }));
    expect(await fetchGitHubStarCount(fetcher as any)).toBeNull();
  });
});
