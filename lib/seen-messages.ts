export const MAX_SEEN_MESSAGES = 500;

export function parseSeenMessageIds(raw: string | null): string[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export function mergeSeenMessageIds(
  existing: Iterable<string>,
  incoming: Iterable<string>,
  limit = MAX_SEEN_MESSAGES,
): string[] {
  if (limit <= 0) return [];

  const merged = new Set<string>();
  for (const id of existing) merged.add(id);
  for (const id of incoming) merged.add(id);

  const values = [...merged];
  return values.length > limit ? values.slice(values.length - limit) : values;
}
