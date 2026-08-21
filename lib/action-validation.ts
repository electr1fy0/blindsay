export const MAX_MESSAGE_LENGTH = 4000;
export const MIN_PAUSE_HOURS = 1;
export const MAX_PAUSE_HOURS = 720;

export function validateMessageContent(content: string): string | null {
  if (!content || content.trim() === "") {
    return "Content cannot be empty";
  }

  if (content.length > MAX_MESSAGE_LENGTH) {
    return `Content must be ${MAX_MESSAGE_LENGTH} characters or fewer.`;
  }

  return null;
}

export function normalizePauseHours(hours: number): number {
  if (!Number.isFinite(hours)) return MIN_PAUSE_HOURS;

  return Math.max(
    MIN_PAUSE_HOURS,
    Math.min(MAX_PAUSE_HOURS, Math.floor(hours)),
  );
}
