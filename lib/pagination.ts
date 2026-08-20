export function parsePositivePage(value: string | undefined, fallback = 1): number {
  if (value === undefined) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  return Math.max(1, Math.floor(parsed));
}
