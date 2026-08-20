import { describe, expect, test } from "bun:test";
import { formatRelativeTime } from "../lib/relative-time";

const NOW = new Date("2026-08-20T12:00:00.000Z");
const second = 1_000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;

function fromNow(deltaMs: number) {
  return new Date(NOW.getTime() + deltaMs);
}

describe("formatRelativeTime", () => {
  test.each([
    [-59_999, "now"],
    [-1, "now"],
    [0, "now"],
    [1, "now"],
    [59_999, "now"],
  ])("treats sub-minute delta %dms as now", (delta, expected) => {
    expect(formatRelativeTime(fromNow(delta), NOW)).toBe(expected);
  });

  test("formats exactly one minute in the past", () => {
    expect(formatRelativeTime(fromNow(-minute), NOW)).toBe("1 minute ago");
  });

  test("formats exactly one minute in the future", () => {
    expect(formatRelativeTime(fromNow(minute), NOW)).toBe("in 1 minute");
  });

  test("rounds within the selected unit", () => {
    expect(formatRelativeTime(fromNow(89 * minute), NOW)).toBe("in 1 hour");
    expect(formatRelativeTime(fromNow(91 * minute), NOW)).toBe("in 2 hours");
  });

  test("uses hours below a day", () => {
    expect(formatRelativeTime(fromNow(-23 * hour), NOW)).toBe("23 hours ago");
    expect(formatRelativeTime(fromNow(23 * hour), NOW)).toBe("in 23 hours");
  });

  test("uses relative day words at one-day boundaries", () => {
    expect(formatRelativeTime(fromNow(-day), NOW)).toBe("yesterday");
    expect(formatRelativeTime(fromNow(day), NOW)).toBe("tomorrow");
  });

  test("uses days below a week", () => {
    expect(formatRelativeTime(fromNow(-6 * day), NOW)).toBe("6 days ago");
    expect(formatRelativeTime(fromNow(6 * day), NOW)).toBe("in 6 days");
  });

  test("uses relative week words at one-week boundaries", () => {
    expect(formatRelativeTime(fromNow(-7 * day), NOW)).toBe("last week");
    expect(formatRelativeTime(fromNow(7 * day), NOW)).toBe("next week");
  });

  test("rounds multi-week values", () => {
    expect(formatRelativeTime(fromNow(-20 * day), NOW)).toBe("3 weeks ago");
    expect(formatRelativeTime(fromNow(20 * day), NOW)).toBe("in 3 weeks");
  });

  test("switches to months at 30 days", () => {
    expect(formatRelativeTime(fromNow(-30 * day), NOW)).toBe("last month");
    expect(formatRelativeTime(fromNow(30 * day), NOW)).toBe("next month");
  });

  test("rounds multi-month values", () => {
    expect(formatRelativeTime(fromNow(-75 * day), NOW)).toBe("2 months ago");
    expect(formatRelativeTime(fromNow(75 * day), NOW)).toBe("in 3 months");
  });

  test("switches to years at 365 days", () => {
    expect(formatRelativeTime(fromNow(-365 * day), NOW)).toBe("last year");
    expect(formatRelativeTime(fromNow(365 * day), NOW)).toBe("next year");
  });

  test("rounds multi-year values", () => {
    expect(formatRelativeTime(fromNow(-800 * day), NOW)).toBe("2 years ago");
    expect(formatRelativeTime(fromNow(800 * day), NOW)).toBe("in 2 years");
  });

  test("uses the provided now rather than wall-clock time", () => {
    const customNow = new Date("2035-01-01T00:00:00.000Z");
    expect(formatRelativeTime(new Date("2035-01-02T00:00:00.000Z"), customNow)).toBe("tomorrow");
  });
});
