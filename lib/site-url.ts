type SiteUrlEnv = {
  NEXT_PUBLIC_SITE_URL?: string | null;
  VERCEL_URL?: string | null;
};

const LOCAL_FALLBACK = "http://localhost:3000";

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function withProtocol(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(value)) {
    return `http://${value}`;
  }
  return `https://${value}`;
}

export function normalizeSiteUrl(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return stripTrailingSlashes(withProtocol(trimmed));
}

export function getBaseUrl(env: SiteUrlEnv = process.env): string {
  return (
    normalizeSiteUrl(env.NEXT_PUBLIC_SITE_URL) ??
    normalizeSiteUrl(env.VERCEL_URL) ??
    LOCAL_FALLBACK
  );
}

export function getProfileUrl(
  username: string,
  env: SiteUrlEnv = process.env,
): string {
  return `${getBaseUrl(env)}/${username}`;
}
