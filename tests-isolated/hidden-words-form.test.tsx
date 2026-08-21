import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findOne, textContent } from "./react-tree";

let valueState = "";
let errorState: string | null = null;
let pendingState = false;
let hookIndex = 0;
let transitionPromise: Promise<unknown> | undefined;

const setValue = mock((_value: string) => {});
const setError = mock((_value: string | null) => {});
const useState = mock((_initial: any) => {
  const index = hookIndex++;
  return index === 0 ? [valueState, setValue] : [errorState, setError];
});
const startTransition = mock((callback: () => unknown) => {
  transitionPromise = Promise.resolve(callback());
});
const useTransition = mock(() => [pendingState, startTransition]);
const updateHiddenWords = mock(async (_words: string[]) => ({ success: true } as any));
const toastSuccess = mock((_message: string) => {});
const TextareaMock = (_props: any) => null;
const ButtonMock = (_props: any) => null;

mock.module("react", () => ({ useState, useTransition }));
mock.module("@/app/actions", () => ({ updateHiddenWords }));
mock.module("sonner", () => ({ toast: toastSuccess }));
mock.module("@/components/ui/textarea", () => ({ Textarea: TextareaMock }));
mock.module("@/components/ui/button", () => ({ Button: ButtonMock }));

const { HiddenWordsForm } = await import("../components/hidden-words-form");

function render(initialValue: string[] = []) {
  hookIndex = 0;
  return HiddenWordsForm({ initialValue });
}

async function submit(tree: any) {
  const form = findOne(tree, (node) => node.type === "form");
  const preventDefault = mock(() => {});
  form.props.onSubmit({ preventDefault });
  await transitionPromise;
  return preventDefault;
}

beforeEach(() => {
  valueState = "";
  errorState = null;
  pendingState = false;
  hookIndex = 0;
  transitionPromise = undefined;
  setValue.mockClear();
  setError.mockClear();
  startTransition.mockClear();
  updateHiddenWords.mockClear();
  updateHiddenWords.mockImplementation(async () => ({ success: true }));
  toastSuccess.mockClear();
});

describe("HiddenWordsForm rendering", () => {
  test("joins initial words with newlines", () => {
    valueState = "alpha\nbeta";
    const tree = render(["alpha", "beta"]);
    expect(findOne(tree, (node) => node.type === TextareaMock).props.value).toBe(
      "alpha\nbeta",
    );
  });

  test("forwards raw textarea edits", () => {
    const tree = render();
    findOne(tree, (node) => node.type === TextareaMock).props.onChange({
      target: { value: "alpha, beta\ngamma" },
    });
    expect(setValue).toHaveBeenCalledWith("alpha, beta\ngamma");
  });

  test("pending state disables textarea and save button", () => {
    pendingState = true;
    const tree = render();
    expect(findOne(tree, (node) => node.type === TextareaMock).props.disabled).toBe(true);
    const button = findOne(tree, (node) => node.type === ButtonMock);
    expect(button.props.disabled).toBe(true);
    expect(textContent(button)).toBe("Saving...");
  });

  test("renders current error state", () => {
    errorState = "Unable to save hidden words.";
    expect(textContent(render())).toContain("Unable to save hidden words.");
  });
});

describe("HiddenWordsForm submission", () => {
  test("parses commas, LF, CRLF, trims blanks, and preserves phrase spacing", async () => {
    valueState = "  Alpha , beta phrase\r\n\n GAMMA  , ,delta";
    const preventDefault = await submit(render());
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(updateHiddenWords).toHaveBeenCalledWith([
      "Alpha",
      "beta phrase",
      "GAMMA",
      "delta",
    ]);
  });

  test("submits an empty list for blank input", async () => {
    valueState = " , \n\r\n ";
    await submit(render());
    expect(updateHiddenWords).toHaveBeenCalledWith([]);
  });

  test("clears a stale error before saving", async () => {
    errorState = "old";
    valueState = "alpha";
    await submit(render());
    expect(setError.mock.calls[0][0]).toBeNull();
  });

  test("successful save shows confirmation and no error", async () => {
    valueState = "alpha";
    await submit(render());
    expect(toastSuccess).toHaveBeenCalledWith("Saved.");
    expect(setError).not.toHaveBeenCalledWith(expect.any(String));
  });

  test("declared server failure stores its message", async () => {
    updateHiddenWords.mockImplementation(async () => ({
      success: false,
      message: "Too many entries",
    }));
    valueState = "alpha";
    await submit(render());
    expect(setError).toHaveBeenLastCalledWith("Too many entries");
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  test("declared failure without a message uses the stable fallback", async () => {
    updateHiddenWords.mockImplementation(async () => ({ success: false }));
    valueState = "alpha";
    await submit(render());
    expect(setError).toHaveBeenLastCalledWith("Unable to save hidden words.");
  });

  test("thrown action errors are contained", async () => {
    updateHiddenWords.mockImplementation(async () => {
      throw new Error("database unavailable");
    });
    valueState = "alpha";
    await expect(submit(render())).resolves.toBeDefined();
    expect(setError).toHaveBeenLastCalledWith("Unable to save hidden words.");
  });
});
