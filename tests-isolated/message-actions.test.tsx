import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, findOne, textContent } from "./react-tree";

let pendingState = false;
let doneState = false;
let openState = false;
let hookIndex = 0;
let transitionPromise: Promise<unknown> | undefined;

const setDone = mock((_value: boolean) => {});
const setOpen = mock((_value: boolean) => {});
const useState = mock((_initial: any) => {
  const index = hookIndex++;
  return index === 0 ? [doneState, setDone] : [openState, setOpen];
});
const startTransition = mock((callback: () => unknown) => {
  transitionPromise = Promise.resolve(callback());
});
const useTransition = mock(() => [pendingState, startTransition]);
const deleteMessage = mock(async (_id: string, _username: string) => ({ success: true } as any));
const refresh = mock(() => {});
const useRouter = mock(() => ({ refresh }));
const toastSuccess = mock((_message: string) => {});
const toastError = mock((_message: string) => {});

const ButtonMock = (_props: any) => null;
const DialogMock = (_props: any) => null;
const DialogCloseMock = (_props: any) => null;
const DialogContentMock = (_props: any) => null;
const DialogDescriptionMock = (_props: any) => null;
const DialogFooterMock = (_props: any) => null;
const DialogHeaderMock = (_props: any) => null;
const DialogTitleMock = (_props: any) => null;
const DialogTriggerMock = (_props: any) => null;
const HugeiconsIconMock = (_props: any) => null;

mock.module("react", () => ({ useState, useTransition }));
mock.module("@/app/actions", () => ({ deleteMessage }));
mock.module("next/navigation", () => ({ useRouter }));
mock.module("sonner", () => ({
  toast: Object.assign(toastSuccess, { error: toastError }),
}));
mock.module("@/components/ui/button", () => ({ Button: ButtonMock }));
mock.module("@/components/ui/dialog", () => ({
  Dialog: DialogMock,
  DialogClose: DialogCloseMock,
  DialogContent: DialogContentMock,
  DialogDescription: DialogDescriptionMock,
  DialogFooter: DialogFooterMock,
  DialogHeader: DialogHeaderMock,
  DialogTitle: DialogTitleMock,
  DialogTrigger: DialogTriggerMock,
}));
mock.module("@hugeicons/react", () => ({ HugeiconsIcon: HugeiconsIconMock }));
mock.module("@hugeicons/core-free-icons", () => ({ Delete01Icon: {} }));

const { DeleteMessageButton } = await import("../components/message-actions");

function render(props: any = {}) {
  hookIndex = 0;
  return DeleteMessageButton({
    messageId: "message-1",
    recipientUsername: "alice",
    ...props,
  });
}

function confirmButton(tree: any) {
  return findOne(
    tree,
    (node) =>
      node.type === ButtonMock &&
      node.props.variant === "destructive" &&
      typeof node.props.onClick === "function",
  );
}

async function confirm(tree: any) {
  confirmButton(tree).props.onClick();
  await transitionPromise;
}

beforeEach(() => {
  pendingState = false;
  doneState = false;
  openState = false;
  hookIndex = 0;
  transitionPromise = undefined;
  setDone.mockClear();
  setOpen.mockClear();
  startTransition.mockClear();
  useState.mockClear();
  useTransition.mockClear();
  deleteMessage.mockClear();
  deleteMessage.mockImplementation(async () => ({ success: true }));
  refresh.mockClear();
  useRouter.mockClear();
  useRouter.mockImplementation(() => ({ refresh }));
  toastSuccess.mockClear();
  toastError.mockClear();
});

describe("DeleteMessageButton rendering", () => {
  test("forwards controlled open state to the dialog", () => {
    openState = true;
    const tree = render();
    const dialog = findOne(tree, (node) => node.type === DialogMock);
    expect(dialog.props.open).toBe(true);
    expect(dialog.props.onOpenChange).toBe(setOpen);
  });

  test("uses icon-xs by default and forwards custom class", () => {
    const tree = render({ className: "danger-zone" });
    const trigger = findOne(tree, (node) => node.type === DialogTriggerMock).props.render;
    expect(trigger.props.size).toBe("icon-xs");
    expect(trigger.props.className).toBe("danger-zone");
    expect(trigger.props.title).toBe("Delete");
  });

  test("forwards an explicit trigger size", () => {
    const tree = render({ size: "lg" });
    expect(findOne(tree, (node) => node.type === DialogTriggerMock).props.render.props.size).toBe(
      "lg",
    );
  });

  test("pending state disables both trigger and confirmation", () => {
    pendingState = true;
    const tree = render();
    const trigger = findOne(tree, (node) => node.type === DialogTriggerMock).props.render;
    expect(trigger.props.disabled).toBe(true);
    expect(confirmButton(tree).props.disabled).toBe(true);
  });

  test("done state disables controls and exposes deleted status", () => {
    doneState = true;
    const tree = render();
    const trigger = findOne(tree, (node) => node.type === DialogTriggerMock).props.render;
    expect(trigger.props.disabled).toBe(true);
    expect(trigger.props.title).toBe("Deleted");
    expect(textContent(trigger)).toContain("Deleted");
    expect(confirmButton(tree).props.disabled).toBe(true);
  });
});

describe("DeleteMessageButton deletion flow", () => {
  test("sends exact message identity to the action", async () => {
    await confirm(render({ messageId: "m-99", recipientUsername: "Alice_Name" }));
    expect(deleteMessage).toHaveBeenCalledWith("m-99", "Alice_Name");
  });

  test("success marks done, closes, calls callback, refreshes, then toasts", async () => {
    const onSuccess = mock(() => {});
    await confirm(render({ onSuccess }));
    expect(setDone).toHaveBeenCalledWith(true);
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("Deleted.");
    expect(toastError).not.toHaveBeenCalled();
  });

  test("success works without an optional callback", async () => {
    await expect(confirm(render())).resolves.toBeUndefined();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test("action-declared failure displays its message and performs no success effects", async () => {
    deleteMessage.mockImplementation(async () => ({
      success: false,
      message: "Cannot delete this message",
    }));
    const onSuccess = mock(() => {});
    await confirm(render({ onSuccess }));
    expect(toastError).toHaveBeenCalledWith("Cannot delete this message");
    expect(setDone).not.toHaveBeenCalledWith(true);
    expect(setOpen).not.toHaveBeenCalledWith(false);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  test("failure without a server message uses a stable fallback", async () => {
    deleteMessage.mockImplementation(async () => ({ success: false }));
    await confirm(render());
    expect(toastError).toHaveBeenCalledWith("Failed to delete message.");
  });

  test("thrown action errors are caught and perform no success effects", async () => {
    deleteMessage.mockImplementation(async () => {
      throw new Error("database down");
    });
    const onSuccess = mock(() => {});
    await expect(confirm(render({ onSuccess }))).resolves.toBeUndefined();
    expect(toastError).toHaveBeenCalledWith("Failed to delete message.");
    expect(setDone).not.toHaveBeenCalledWith(true);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });
});
