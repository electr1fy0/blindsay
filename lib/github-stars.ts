type FetchLike = (
  input: string,
  init?: {
    next?: { revalidate: number };
    headers?: Record<string, string>;
  },
) => Promise<{
  ok: boolean;
  json(): Promise<unknown>;
}>;

export function parseGitHubStarCount(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const value = (data as { stargazers_count?: unknown }).stargazers_count;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.floor(value);
}

export function formatGitHubStarCount(count: number | null): string | null {
  if (count === null || !Number.isFinite(count) || count < 0) return null;
  const normalized = Math.floor(count);
  return normalized >= 1000
    ? `${(normalized / 1000).toFixed(1)}k`
    : String(normalized);
}

export async function fetchGitHubStarCount(
  fetcher: FetchLike = fetch as FetchLike,
): Promise<number | null> {
  try {
    const response = await fetcher(
      "https://api.github.com/repos/electr1fy0/blindsay",
      {
        next: { revalidate: 3600 },
        headers: { Accept: "application/vnd.github+json" },
      },
    );
    if (!response.ok) return null;
    return parseGitHubStarCount(await response.json());
  } catch {
    return null;
  }
}
