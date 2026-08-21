import { describe, expect, test } from "bun:test";
import {
  containsHiddenWords,
  normalizeHiddenWords,
  parseHiddenWordsInput,
} from "../lib/hidden-words";

describe("parseHiddenWordsInput", () => {
  test("splits comma-separated words", () => {
    expect(parseHiddenWordsInput("alpha,beta,gamma")).toEqual([
      "alpha",
      "beta",
      "gamma",
    ]);
  });

  test("splits newline-separated words", () => {
    expect(parseHiddenWordsInput("alpha\nbeta\ngamma")).toEqual([
      "alpha",
      "beta",
      "gamma",
    ]);
  });

  test("handles mixed commas, LF, and CRLF", () => {
    expect(parseHiddenWordsInput("alpha, beta\r\ngamma\ndelta")).toEqual([
      "alpha",
      "beta",
      "gamma",
      "delta",
    ]);
  });

  test("trims entries and drops blanks", () => {
    expect(parseHiddenWordsInput("  alpha  , ,\n  beta  \n")).toEqual([
      "alpha",
      "beta",
    ]);
  });

  test("preserves spaces inside phrases", () => {
    expect(parseHiddenWordsInput("very bad phrase, another phrase")).toEqual([
      "very bad phrase",
      "another phrase",
    ]);
  });
});

describe("normalizeHiddenWords", () => {
  test("trims and lowercases values", () => {
    expect(normalizeHiddenWords(["  Alpha ", "BETA"])).toEqual([
      "alpha",
      "beta",
    ]);
  });

  test("removes empty values", () => {
    expect(normalizeHiddenWords(["", " ", "\t", "alpha"])).toEqual([
      "alpha",
    ]);
  });

  test("deduplicates after normalization while preserving first-seen order", () => {
    expect(
      normalizeHiddenWords(["Alpha", " beta ", "ALPHA", "BETA", "gamma"]),
    ).toEqual(["alpha", "beta", "gamma"]);
  });
});

describe("containsHiddenWords", () => {
  test("returns false for an empty hidden-word list", () => {
    expect(containsHiddenWords("anything", [])).toBe(false);
  });

  test("matches case-insensitively", () => {
    expect(containsHiddenWords("This has a SECRET inside", ["secret"])).toBe(
      true,
    );
  });

  test("supports multi-word phrases", () => {
    expect(
      containsHiddenWords("please avoid very bad phrase here", [
        "very bad phrase",
      ]),
    ).toBe(true);
  });

  test("returns false when no hidden word is present", () => {
    expect(containsHiddenWords("clean message", ["secret", "blocked"])).toBe(
      false,
    );
  });
});
