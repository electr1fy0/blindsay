export function parseHiddenWordsInput(raw: string): string[] {
  return raw
    .split(/\n|,/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0);
}

export function normalizeHiddenWords(words: string[]): string[] {
  const normalized = new Set<string>();

  for (const word of words) {
    const value = word.trim().toLowerCase();
    if (value.length > 0) normalized.add(value);
  }

  return [...normalized];
}

export function containsHiddenWords(content: string, words: string[]): boolean {
  if (words.length === 0) return false;
  const normalized = content.toLowerCase();
  return words.some((word) => normalized.includes(word));
}
