import { describe, expect, test } from "bun:test";
import { parsePositivePage } from "../lib/pagination";

describe("parsePositivePage", () => {
  test.each([
    [undefined, 1],
    ["", 1],
    ["0", 1],
    ["-1", 1],
    ["-999999", 1],
    ["1", 1],
    ["2", 2],
    ["2.9", 2],
    ["0007", 7],
    ["NaN", 1],
    ["abc", 1],
    ["Infinity", 1],
    ["-Infinity", 1],
  ])("parses %p as %p", (value, expected) => {
    expect(parsePositivePage(value)).toBe(expected);
  });

  test("supports an explicit fallback", () => {
    expect(parsePositivePage("not-a-page", 3)).toBe(3);
    expect(parsePositivePage(undefined, 3)).toBe(3);
  });
});
