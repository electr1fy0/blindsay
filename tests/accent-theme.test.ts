import { describe, expect, mock, test } from "bun:test";
import {
  ACCENT_THEME_IDS,
  isAccentTheme,
  persistAccentTheme,
  readAccentTheme,
} from "../lib/accent-theme";

describe("isAccentTheme", () => {
  test.each(ACCENT_THEME_IDS)("accepts %s", (theme) => {
    expect(isAccentTheme(theme)).toBe(true);
  });

  test.each(["", "purple", "SKY", null, undefined, 42, {}])(
    "rejects %p",
    (value) => {
      expect(isAccentTheme(value)).toBe(false);
    },
  );
});

describe("readAccentTheme", () => {
  test("prefers a valid server-rendered dataset value over storage", () => {
    const getItem = mock(() => "rose");
    expect(readAccentTheme("sage", { getItem })).toBe("sage");
    expect(getItem).not.toHaveBeenCalled();
  });

  test("falls back to a valid stored theme", () => {
    expect(readAccentTheme(undefined, { getItem: () => "rose" })).toBe("rose");
  });

  test("ignores invalid dataset and storage values", () => {
    expect(readAccentTheme("invalid", { getItem: () => "purple" })).toBe("sky");
  });

  test("falls back to sky when storage is empty", () => {
    expect(readAccentTheme(undefined, { getItem: () => null })).toBe("sky");
  });

  test("falls back to sky when reading storage throws", () => {
    expect(
      readAccentTheme(undefined, {
        getItem: () => {
          throw new Error("storage denied");
        },
      }),
    ).toBe("sky");
  });
});

describe("persistAccentTheme", () => {
  test("stores the selected theme", () => {
    const setItem = mock((_key: string, _value: string) => {});
    expect(persistAccentTheme({ setItem }, "sage")).toBe(true);
    expect(setItem).toHaveBeenCalledWith("blindsay-accent-theme", "sage");
  });

  test("returns false instead of throwing when storage is unavailable", () => {
    expect(
      persistAccentTheme(
        {
          setItem: () => {
            throw new Error("quota/storage denied");
          },
        },
        "rose",
      ),
    ).toBe(false);
  });
});
