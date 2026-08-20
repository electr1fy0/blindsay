import { describe, expect, test } from "bun:test";
import {
  MAX_MESSAGE_LENGTH,
  MAX_PAUSE_HOURS,
  MIN_PAUSE_HOURS,
  normalizePauseHours,
  validateMessageContent,
} from "../lib/action-validation";

describe("validateMessageContent", () => {
  test.each(["", " ", "\n\t "])("rejects empty content %#", (content) => {
    expect(validateMessageContent(content)).toBe("Content cannot be empty");
  });

  test("accepts exactly the maximum length", () => {
    expect(validateMessageContent("x".repeat(MAX_MESSAGE_LENGTH))).toBeNull();
  });

  test("rejects one character over the server limit", () => {
    expect(validateMessageContent("x".repeat(MAX_MESSAGE_LENGTH + 1))).toBe(
      `Content must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
    );
  });

  test("does not trim valid content before validating length", () => {
    expect(validateMessageContent(` ${"x".repeat(MAX_MESSAGE_LENGTH - 2)} `)).toBeNull();
  });
});

describe("normalizePauseHours", () => {
  test.each([
    [Number.NaN, MIN_PAUSE_HOURS],
    [Number.POSITIVE_INFINITY, MIN_PAUSE_HOURS],
    [Number.NEGATIVE_INFINITY, MIN_PAUSE_HOURS],
    [-100, MIN_PAUSE_HOURS],
    [0, MIN_PAUSE_HOURS],
    [0.99, MIN_PAUSE_HOURS],
    [1, 1],
    [2.99, 2],
    [MAX_PAUSE_HOURS, MAX_PAUSE_HOURS],
    [MAX_PAUSE_HOURS + 1, MAX_PAUSE_HOURS],
    [10_000, MAX_PAUSE_HOURS],
  ])("normalizes %p to %p", (input, expected) => {
    expect(normalizePauseHours(input)).toBe(expected);
  });
});
