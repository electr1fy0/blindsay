import { describe, expect, mock, test } from "bun:test";
import { copyTextToClipboard } from "../lib/clipboard";

describe("copyTextToClipboard", () => {
  test("returns false without a navigator", async () => {
    expect(await copyTextToClipboard("hello", undefined)).toBe(false);
  });

  test("returns false without a clipboard object", async () => {
    expect(await copyTextToClipboard("hello", {})).toBe(false);
  });

  test("returns false without writeText", async () => {
    expect(await copyTextToClipboard("hello", { clipboard: {} })).toBe(false);
  });

  test("writes the exact text and reports success", async () => {
    const writeText = mock(async (_text: string) => undefined);
    const clipboard = { writeText };

    expect(await copyTextToClipboard(" https://example.test/a ", { clipboard })).toBe(
      true,
    );
    expect(writeText).toHaveBeenCalledWith(" https://example.test/a ");
  });

  test("preserves clipboard method receiver", async () => {
    let receiver: unknown;
    const clipboard = {
      async writeText(this: unknown, _text: string) {
        receiver = this;
      },
    };

    expect(await copyTextToClipboard("hello", { clipboard })).toBe(true);
    expect(receiver).toBe(clipboard);
  });

  test("turns permission rejection into false", async () => {
    const writeText = mock(async () => {
      throw new DOMException("denied", "NotAllowedError");
    });
    expect(
      await copyTextToClipboard("hello", { clipboard: { writeText } }),
    ).toBe(false);
  });

  test("turns arbitrary clipboard failures into false", async () => {
    const writeText = mock(async () => {
      throw "clipboard exploded";
    });
    expect(
      await copyTextToClipboard("hello", { clipboard: { writeText } }),
    ).toBe(false);
  });
});
