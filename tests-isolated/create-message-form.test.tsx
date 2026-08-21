import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, findOne, textContent } from "./react-tree";

let pendingState = false;
let errorState: string | null = null;
let sentState = false;
let stateIndex = 0;
let transitionPromise: Promise<unknown> | undefined;
let draftValue = "";
let draftHydrated = true;

const setError = mock((_value: string | null) => {});
const setSent = mock((_value: boolean) => {});
const useState = mock((_initial: any) => {
  const index = stateIndex++;
  return index === 0 ? [errorState, setError] : [sentState, setSent];
});
const startTransition = mock((callback: () => unknown) => {
  transitionPromise = Promise.resolve(callback());
});
const useTransition = mock(() => [pendingState, startTransition]);
const setDraftValue = mock((_value: string) => {});
const clearDraft = mock(() => {});
const usePersistedDraft = mock((_key: string) => ({
  value: draftValue,
  setValue: setDraftValue,
  clearDraft,
  hydrated: draftHydrated,
}));
const createAnonymousMessage = mock(async (..._args: any[]) => ({ success: true } as any));
const toastError = mock((_message: string) => {});
const TextareaMock = (_props: any) => null;
const ButtonMock = (_props: any) => null;

mock.module("react", () => ({ useState, useTransition }));
mock.module("@/lib/use-persisted-draft", () => ({ usePersistedDraft }));
mock.module("@/app/actions", () => ({ createAnonymousMessage }));
mock.module("sonner", () => ({ toast: { error: toastError } }));
mock.module("@/components/ui/textarea", () => ({ Textarea: TextareaMock }));
mock.module("@/components/ui/button", () => ({ Button: ButtonMock }));

const { CreateMessageForm } = await import("../components/create-message-form");

function render(props: any = {}) {
  stateIndex = 0;
  return CreateMessageForm({
    recipientId: "recipient-1",
    recipientUsername: "Alice_Name",
    ...props,
  });
}

async function submit(tree: any) {
  const form = findOne(tree, (node) => node.type === "form");
  const preventDefault = mock(() => {});
  form.props.onSubmit({ preventDefault });
  await transitionPromise;
  return preventDefault;
}

beforeEach(() => {
  pendingState = false;
  errorState = null;
  sentState = false;
  stateIndex = 0;
  transitionPromise = undefined;
  draftValue = "";
  draftHydrated = true;
  setError.mockClear();
  setSent.mockClear();
  startTransition.mockClear();
  setDraftValue.mockClear();
  clearDraft.mockClear();
  usePersistedDraft.mockClear();
  createAnonymousMessage.mockClear();
  createAnonymousMessage.mockImplementation(async () => ({ success: true }));
  toastError.mockClear();
});

describe("CreateMessageForm draft and input behavior", () => {
  test("uses a recipient-scoped lowercased draft key", () => {
    render();
    expect(usePersistedDraft).toHaveBeenCalledWith(
      "anonymous:recipient-1:alice_name",
    );
  });

  test("renders the draft value and current character count", () => {
    draftValue = "hello";
    const tree = render();
    expect(findOne(tree, (node) => node.type === TextareaMock).props.value).toBe("hello");
    expect(textContent(tree)).toContain("5/4000");
  });

  test("shows the persisted-draft notice only after hydration with content", () => {
    draftValue = "hello";
    expect(textContent(render())).toContain("Draft saved on this device.");
    draftHydrated = false;
    expect(textContent(render())).not.toContain("Draft saved on this device.");
  });

  test("caps client input at 4000 characters", () => {
    const tree = render();
    const input = "x".repeat(4500);
    findOne(tree, (node) => node.type === TextareaMock).props.onChange({
      target: { value: input },
    });
    expect(setDraftValue).toHaveBeenCalledWith("x".repeat(4000));
  });

  test("does not trim normal input edits", () => {
    const tree = render();
    findOne(tree, (node) => node.type === TextareaMock).props.onChange({
      target: { value: "  hello  " },
    });
    expect(setDraftValue).toHaveBeenCalledWith("  hello  ");
  });

  test("disables submission for whitespace-only content", () => {
    draftValue = "   \n";
    const tree = render();
    expect(findOne(tree, (node) => node.type === ButtonMock).props.disabled).toBe(true);
  });

  test("pending state disables textarea and submit button", () => {
    pendingState = true;
    draftValue = "hello";
    const tree = render();
    expect(findOne(tree, (node) => node.type === TextareaMock).props.disabled).toBe(true);
    const button = findOne(tree, (node) => node.type === ButtonMock);
    expect(button.props.disabled).toBe(true);
    expect(textContent(button)).toBe("Sending...");
  });
});

describe("CreateMessageForm keyboard submission", () => {
  test.each([
    [{ key: "Enter", metaKey: true, ctrlKey: false }, true],
    [{ key: "Enter", metaKey: false, ctrlKey: true }, true],
    [{ key: "Enter", metaKey: false, ctrlKey: false }, false],
    [{ key: "a", metaKey: true, ctrlKey: false }, false],
  ])("handles shortcut %p", (keys, shouldSubmit) => {
    const tree = render();
    const requestSubmit = mock(() => {});
    const preventDefault = mock(() => {});
    findOne(tree, (node) => node.type === TextareaMock).props.onKeyDown({
      ...keys,
      preventDefault,
      currentTarget: { form: { requestSubmit } },
    });
    expect(requestSubmit).toHaveBeenCalledTimes(shouldSubmit ? 1 : 0);
    expect(preventDefault).toHaveBeenCalledTimes(shouldSubmit ? 1 : 0);
  });

  test("shortcut is safe when textarea has no form", () => {
    const tree = render();
    const preventDefault = mock(() => {});
    expect(() =>
      findOne(tree, (node) => node.type === TextareaMock).props.onKeyDown({
        key: "Enter",
        metaKey: true,
        ctrlKey: false,
        preventDefault,
        currentTarget: { form: null },
      }),
    ).not.toThrow();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});

describe("CreateMessageForm submission flow", () => {
  test("whitespace submission exits before starting a transition", async () => {
    draftValue = "   \n";
    const preventDefault = await submit(render());
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(startTransition).not.toHaveBeenCalled();
    expect(createAnonymousMessage).not.toHaveBeenCalled();
  });

  test("submits exact untrimmed content and identity", async () => {
    draftValue = "  honest note  ";
    await submit(render());
    expect(createAnonymousMessage).toHaveBeenCalledWith(
      "recipient-1",
      "Alice_Name",
      "  honest note  ",
    );
  });

  test("clears stale error before requesting", async () => {
    draftValue = "hello";
    errorState = "old";
    await submit(render());
    expect(setError.mock.calls[0][0]).toBeNull();
  });

  test("success clears draft, enters sent state, and fires optional callback", async () => {
    draftValue = "hello";
    const onSuccess = mock(() => {});
    await submit(render({ onSuccess }));
    expect(clearDraft).toHaveBeenCalledTimes(1);
    expect(setSent).toHaveBeenCalledWith(true);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(toastError).not.toHaveBeenCalled();
  });

  test("success works when callback is omitted", async () => {
    draftValue = "hello";
    await expect(submit(render())).resolves.toBeDefined();
    expect(setSent).toHaveBeenCalledWith(true);
  });

  test("declared failure preserves draft and renders/toasts its message", async () => {
    draftValue = "hello";
    createAnonymousMessage.mockImplementation(async () => ({
      success: false,
      message: "Inbox is paused",
    }));
    await submit(render());
    expect(clearDraft).not.toHaveBeenCalled();
    expect(setSent).not.toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenLastCalledWith("Inbox is paused");
    expect(toastError).toHaveBeenCalledWith("Inbox is paused");
  });

  test("declared failure without message uses a stable fallback", async () => {
    draftValue = "hello";
    createAnonymousMessage.mockImplementation(async () => ({ success: false }));
    await submit(render());
    expect(setError).toHaveBeenLastCalledWith("Failed to send message.");
    expect(toastError).toHaveBeenCalledWith("Failed to send message.");
  });

  test("thrown Error surfaces its message", async () => {
    draftValue = "hello";
    createAnonymousMessage.mockImplementation(async () => {
      throw new Error("Network unavailable");
    });
    await submit(render());
    expect(setError).toHaveBeenLastCalledWith("Network unavailable");
    expect(toastError).toHaveBeenCalledWith("Network unavailable");
  });

  test("non-Error thrown values use the stable fallback", async () => {
    draftValue = "hello";
    createAnonymousMessage.mockImplementation(async () => {
      throw "boom";
    });
    await submit(render());
    expect(setError).toHaveBeenLastCalledWith("Failed to send message.");
  });
});

describe("sent confirmation", () => {
  test("renders confirmation instead of the form", () => {
    sentState = true;
    const tree = render();
    expect(textContent(tree)).toContain("Your message was sent anonymously.");
    expect(findAll(tree, (node) => node.type === TextareaMock)).toHaveLength(0);
  });

  test("Send another returns to compose state", () => {
    sentState = true;
    const tree = render();
    const button = findOne(
      tree,
      (node) => node.type === "button" && textContent(node).includes("Send another"),
    );
    button.props.onClick();
    expect(setSent).toHaveBeenCalledWith(false);
  });
});
