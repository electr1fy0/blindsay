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
const setUsername = mock(async (_value: string) => ({ success: true } as any));
const InputMock = (_props: any) => null;
const ButtonMock = (_props: any) => null;

mock.module("react", () => ({ useState, useTransition }));
mock.module("@/app/actions", () => ({ setUsername }));
mock.module("@/components/ui/input", () => ({ Input: InputMock }));
mock.module("@/components/ui/button", () => ({ Button: ButtonMock }));
mock.module("sonner", () => ({ toast: {} }));

const { UsernameForm } = await import("../components/username-form");

function render(props: any = {}) {
  hookIndex = 0;
  return UsernameForm(props);
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
  useState.mockClear();
  useTransition.mockClear();
  startTransition.mockClear();
  setUsername.mockClear();
  setUsername.mockImplementation(async () => ({ success: true }));
});

describe("UsernameForm rendering", () => {
  test("uses an empty string when initialValue is omitted", () => {
    const tree = render();
    expect(findOne(tree, (node) => node.type === InputMock).props.value).toBe("");
  });

  test("uses the provided initial value", () => {
    valueState = "alice";
    const tree = render({ initialValue: "alice" });
    expect(findOne(tree, (node) => node.type === InputMock).props.value).toBe("alice");
  });

  test("disables submit for blank or whitespace-only values", () => {
    valueState = "   ";
    const tree = render();
    expect(findOne(tree, (node) => node.type === ButtonMock).props.disabled).toBe(true);
  });

  test("enables submit for non-blank values", () => {
    valueState = "alice";
    const tree = render();
    expect(findOne(tree, (node) => node.type === ButtonMock).props.disabled).toBe(false);
  });

  test("forwards raw input edits into component state", () => {
    const tree = render();
    findOne(tree, (node) => node.type === InputMock).props.onChange({
      target: { value: " Alice_1 " },
    });
    expect(setValue).toHaveBeenCalledWith(" Alice_1 ");
  });

  test("renders a custom submit label", () => {
    valueState = "alice";
    const tree = render({ submitLabel: "Claim it" });
    expect(textContent(findOne(tree, (node) => node.type === ButtonMock))).toBe("Claim it");
  });

  test("pending state disables input and button and swaps label", () => {
    valueState = "alice";
    pendingState = true;
    const tree = render();
    expect(findOne(tree, (node) => node.type === InputMock).props.disabled).toBe(true);
    const button = findOne(tree, (node) => node.type === ButtonMock);
    expect(button.props.disabled).toBe(true);
    expect(textContent(button)).toBe("Saving...");
  });

  test("renders the current error state", () => {
    errorState = "That username is taken.";
    const tree = render();
    expect(textContent(tree)).toContain("That username is taken.");
  });
});

describe("UsernameForm submission", () => {
  test("prevents native form submission and sends the exact current value", async () => {
    valueState = " Alice_1 ";
    const tree = render();
    const preventDefault = await submit(tree);
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(setUsername).toHaveBeenCalledWith(" Alice_1 ");
  });

  test("clears stale error before each request", async () => {
    valueState = "alice";
    errorState = "old error";
    await submit(render());
    expect(setError.mock.calls[0][0]).toBeNull();
  });

  test("stores the action-provided failure message", async () => {
    valueState = "alice";
    setUsername.mockImplementation(async () => ({
      success: false,
      message: "Already taken",
    }));
    await submit(render());
    expect(setError).toHaveBeenLastCalledWith("Already taken");
  });

  test("uses a fallback when a failed action has no message", async () => {
    valueState = "alice";
    setUsername.mockImplementation(async () => ({ success: false }));
    await submit(render());
    expect(setError).toHaveBeenLastCalledWith("Unable to save username.");
  });

  test("converts thrown action failures into a stable UI error", async () => {
    valueState = "alice";
    setUsername.mockImplementation(async () => {
      throw new Error("database offline");
    });
    await submit(render());
    expect(setError).toHaveBeenLastCalledWith("Unable to save username.");
  });
});
