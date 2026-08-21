import { describe, expect, test } from "bun:test";
import {
  MAX_SEEN_MESSAGES,
  mergeSeenMessageIds,
  parseSeenMessageIds,
} from "../lib/seen-messages";

describe("parseSeenMessageIds", () => {
  test.each([null, "", "not-json", "{}", "42", "true"])(
    "treats invalid persisted state %p as empty",
    (raw) => {
      expect(parseSeenMessageIds(raw)).toEqual([]);
    },
  );

  test("returns string IDs from a persisted array", () => {
    expect(parseSeenMessageIds('["a","b","c"]')).toEqual(["a", "b", "c"]);
  });

  test("drops non-string values from mixed persisted arrays", () => {
    expect(parseSeenMessageIds('["a",1,null,false,{},"b"]')).toEqual(["a", "b"]);
  });
});

describe("mergeSeenMessageIds", () => {
  test("preserves existing insertion order and appends new IDs", () => {
    expect(mergeSeenMessageIds(["a", "b"], ["c", "d"])).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  test("deduplicates IDs already marked as seen", () => {
    expect(mergeSeenMessageIds(["a", "b"], ["b", "a", "c"])).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  test("evicts the oldest IDs when the cap is exceeded", () => {
    const existing = Array.from({ length: MAX_SEEN_MESSAGES }, (_, i) => `old-${i}`);
    const merged = mergeSeenMessageIds(existing, ["new-1", "new-2"]);

    expect(merged).toHaveLength(MAX_SEEN_MESSAGES);
    expect(merged[0]).toBe("old-2");
    expect(merged.at(-2)).toBe("new-1");
    expect(merged.at(-1)).toBe("new-2");
  });

  test("supports a smaller explicit cap", () => {
    expect(mergeSeenMessageIds(["a", "b"], ["c", "d"], 2)).toEqual(["c", "d"]);
  });

  test("returns an empty list for a non-positive cap", () => {
    expect(mergeSeenMessageIds(["a"], ["b"], 0)).toEqual([]);
    expect(mergeSeenMessageIds(["a"], ["b"], -1)).toEqual([]);
  });
});
