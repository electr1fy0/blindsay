import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, findOne, textContent } from "./react-tree";

let openState = false;
let errorState: string | null = null;
let pendingState = false;
let stateIndex = 0;
let transitionPromise: Promise<unknown> | undefined;
let draftValue = "";
const formRef = { current: null as any };

const setOpen = mock((_value: boolean) => {});
const setError = mock((_value: string | null) => {});
const useState = mock((_initial: any) => {
  const index = stateIndex++;
  return index === 0 ? [openState, setOpen] : [errorState, setError];
});
const startTransition = mock((callback: () => unknown) => {
  transitionPromise = Promise.resolve(callback());
});
const useTransition = mock(() => [pendingState, startTransition]);
const useRef = mock((_initial: any) => formRef);
const setDraftValue = mock((_value: string) => {});
const clearDraft = mock(() => {});
const usePersistedDraft = mock((_key: string) => ({
  value: draftValue,
  setValue: setDraftValue,
  clearDraft,
  hydrated: true,
}));
const createReplyMessage = mock(async (..._args: any[]) => ({ success: true } as any));
const refresh = mock(() => {});
const useRouter = mock(() => ({ refresh }));
const toastSuccess = mock((_message: string) => {});
const toastError = mock((_message: string) => {});
const ButtonMock = (_props: any) => null;
const TextareaMock = (_props: any) => null;
const MotionDivMock = (_props: any) => null;
const AnimatePresenceMock = (_props: any) => null;
const IconLoader2Mock = (_props: any) => null;

mock.module("react", () => ({ useState, useTransition, useRef }));
mock.module("@/lib/use-persisted-draft", () => ({ usePersistedDraft }));
mock.module("@/app/actions", () => ({ createReplyMessage }));
mock.module("next/navigation", () => ({ useRouter }));
mock.module("sonner", () => ({
  toast: Object.assign(toastSuccess, { error: toastError }),
}));
mock.module("@/components/ui/button", () => ({ Button: ButtonMock }));
mock.module("@/components/ui/textarea", () => ({ Textarea: TextareaMock }));
mock.module("motion/react", () => ({
  motion: { div: MotionDivMock },
  AnimatePresence: AnimatePresenceMock,
}));
mock.module("@tabler/icons-react", () => ({ IconLoader2: IconLoader2Mock }));
mock.module("@/lib/generated/prisma/models", () => ({}));

const { ReplyForm } = await import("../components/reply-form");

function render(props: any = {}) {
  stateIndex = 0;
  return ReplyForm({
    recipientId: "owner-1",
    recipientUsername: "Alice_Name",
    parentId: "parent-1",
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
  openState = false;
  errorState = null;
  pendingState = false;
  stateIndex = 0;
  transitionPromise = undefined;
  draftValue = "";
  formRef.current = null;
  setOpen.mockClear();
  setError.mockClear();
  startTransition.mockClear();
  useRef.mockClear();
  setDraftValue.mockClear();
  clearDraft.mockClear();
  usePersistedDraft.mockClear();
  createReplyMessage.mockClear();
  createReplyMessage.mockImplementation(async () => ({ success: true }));
  refresh.mockClear();
  toastSuccess.mockClear();
  toastError.mockClear();
});

describe("ReplyForm closed state", () => {
  test("uses a recipient and parent scoped lowercase draft key", () => {
    render();
    expect(usePersistedDraft).toHaveBeenCalledWith(
      "reply:owner-1:alice_name:parent-1",
    );
  });

  test("renders Reply trigger but no composer while closed", () => {
    const tree = render();
    expect(textContent(tree)).toContain("Reply");
    expect(findAll(tree, (node) => node.type === TextareaMock)).toHaveLength(0);
  });

  test("Reply trigger opens the composer", () => {
    const tree = render();
    const button = findOne(
      tree,
      (node) => node.type === ButtonMock && textContent(node) === "Reply",
    );
    button.props.onClick();
    expect(setOpen).toHaveBeenCalledWith(true);
  });
});

describe("ReplyForm open state", () => {
  beforeEach(() => {
    openState = true;
  });

  test("renders current draft and character count", () => {
    draftValue = "thanks";
    const tree = render();
    expect(findOne(tree, (node) => node.type === TextareaMock).props.value).toBe("thanks");
    expect(textContent(tree)).toContain("6/4000");
  });

  test("caps typed replies at 4000 characters", () => {
    const tree = render();
    findOne(tree, (node) => node.type === TextareaMock).props.onChange({
      target: { value: "r".repeat(4200) },
    });
    expect(setDraftValue).toHaveBeenCalledWith("r".repeat(4000));
  });

  test("preserves surrounding spaces in input state", () => {
    const tree = render();
    findOne(tree, (node) => node.type === TextareaMock).props.onChange({
      target: { value: "  reply  " },
    });
    expect(setDraftValue).toHaveBeenCalledWith("  reply  ");
  });

  test("blank draft disables Send reply", () => {
    draftValue = " \n ";
    const tree = render();
    const send = findOne(
      tree,
      (node) => node.type === ButtonMock && node.props.type === "submit",
    );
    expect(send.props.disabled).toBe(true);
  });

  test("pending state disables textarea, cancel, and send", () => {
    pendingState = true;
    draftValue = "reply";
    const tree = render();
    expect(findOne(tree, (node) => node.type === TextareaMock).props.disabled).toBe(true);
    const buttons = findAll(tree, (node) => node.type === ButtonMock);
    expect(buttons.every((button) => button.props.disabled === true)).toBe(true);
    expect(textContent(tree)).toContain("Sending...");
    expect(findAll(tree, (node) => node.type === IconLoader2Mock)).toHaveLength(1);
  });

  test("Cancel closes composer and clears a displayed error without deleting draft", () => {
    errorState = "old error";
    draftValue = "keep me";
    const tree = render();
    const cancel = findOne(
      tree,
      (node) => node.type === ButtonMock && textContent(node) === "Cancel",
    );
    cancel.props.onClick();
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(setError).toHaveBeenCalledWith(null);
    expect(clearDraft).not.toHaveBeenCalled();
  });

  test("renders server error state", () => {
    errorState = "Only one reply is allowed.";
    expect(textContent(render())).toContain("Only one reply is allowed.");
  });
});

describe("ReplyForm keyboard shortcut", () => {
  beforeEach(() => {
    openState = true;
  });

  test.each([
    [{ key: "Enter", metaKey: true, ctrlKey: false }, true],
    [{ key: "Enter", metaKey: false, ctrlKey: true }, true],
    [{ key: "Enter", metaKey: false, ctrlKey: false }, false],
    [{ key: "x", metaKey: true, ctrlKey: false }, false],
  ])("handles %p", (keys, shouldSubmit) => {
    const requestSubmit = mock(() => {});
    formRef.current = { requestSubmit };
    const tree = render();
    const preventDefault = mock(() => {});
    findOne(tree, (node) => node.type === TextareaMock).props.onKeyDown({
      ...keys,
      preventDefault,
    });
    expect(requestSubmit).toHaveBeenCalledTimes(shouldSubmit ? 1 : 0);
    expect(preventDefault).toHaveBeenCalledTimes(shouldSubmit ? 1 : 0);
  });

  test("shortcut tolerates a null form ref", () => {
    formRef.current = null;
    const tree = render();
    expect(() =>
      findOne(tree, (node) => node.type === TextareaMock).props.onKeyDown({
        key: "Enter",
        metaKey: true,
        ctrlKey: false,
        preventDefault() {},
      }),
    ).not.toThrow();
  });
});

describe("ReplyForm submission", () => {
  beforeEach(() => {
    openState = true;
  });

  test("whitespace reply exits before creating a transition", async () => {
    draftValue = "  \n ";
    const preventDefault = await submit(render());
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(startTransition).not.toHaveBeenCalled();
    expect(createReplyMessage).not.toHaveBeenCalled();
  });

  test("submits exact identity and untrimmed content", async () => {
    draftValue = "  thanks  ";
    await submit(render());
    expect(createReplyMessage).toHaveBeenCalledWith(
      "owner-1",
      "Alice_Name",
      "parent-1",
      "  thanks  ",
    );
  });

  test("clears stale error before requesting", async () => {
    draftValue = "reply";
    errorState = "old";
    await submit(render());
    expect(setError.mock.calls[0][0]).toBeNull();
  });

  test("successful reply clears draft, closes composer, refreshes, and toasts", async () => {
    draftValue = "reply";
    const reply = { id: "reply-1", content: "reply" };
    createReplyMessage.mockImplementation(async () => ({ success: true, reply }));
    const onSuccess = mock((_reply: any) => {});
    await submit(render({ onSuccess }));
    expect(clearDraft).toHaveBeenCalledTimes(1);
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalledWith(reply);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("Sent.");
  });

  test("successful action without a returned reply still clears, closes, and refreshes", async () => {
    draftValue = "reply";
    const onSuccess = mock(() => {});
    createReplyMessage.mockImplementation(async () => ({ success: true }));
    await submit(render({ onSuccess }));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(clearDraft).toHaveBeenCalledTimes(1);
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test("declared failure preserves draft and shows action message", async () => {
    draftValue = "reply";
    createReplyMessage.mockImplementation(async () => ({
      success: false,
      message: "Only one reply is allowed.",
    }));
    await submit(render());
    expect(clearDraft).not.toHaveBeenCalled();
    expect(setOpen).not.toHaveBeenCalledWith(false);
    expect(refresh).not.toHaveBeenCalled();
    expect(setError).toHaveBeenLastCalledWith("Only one reply is allowed.");
    expect(toastError).toHaveBeenCalledWith("Only one reply is allowed.");
  });

  test("declared failure without message uses fallback", async () => {
    draftValue = "reply";
    createReplyMessage.mockImplementation(async () => ({ success: false }));
    await submit(render());
    expect(setError).toHaveBeenLastCalledWith("Failed to send reply.");
  });

  test("thrown action errors use the stable generic failure", async () => {
    draftValue = "reply";
    createReplyMessage.mockImplementation(async () => {
      throw new Error("sensitive database detail");
    });
    await submit(render());
    expect(setError).toHaveBeenLastCalledWith("Failed to send reply.");
    expect(toastError).toHaveBeenCalledWith("Failed to send reply.");
    expect(refresh).not.toHaveBeenCalled();
  });
});
