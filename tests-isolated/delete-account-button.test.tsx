import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, findOne, textContent } from "./react-tree";

let pendingState = false;
let openState = false;
let transitionPromise: Promise<unknown> | undefined;
const setOpen = mock((_value: boolean) => {});
const useState = mock((_initial: any) => [openState, setOpen]);
const startTransition = mock((callback: () => unknown) => {
  transitionPromise = Promise.resolve(callback());
});
const useTransition = mock(() => [pendingState, startTransition]);
const deleteAccount = mock(async () => ({ success: true } as any));
const signOut = mock(async (_options?: any) => undefined);
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

mock.module("react", () => ({ useState, useTransition }));
mock.module("next-auth/react", () => ({ signOut }));
mock.module("@/app/actions", () => ({ deleteAccount }));
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
mock.module("sonner", () => ({ toast: { error: toastError } }));

const { DeleteAccountButton } = await import("../components/delete-account-button");

function confirmButton(tree: any) {
  return findOne(
    tree,
    (node) => node.type === ButtonMock && typeof node.props.onClick === "function",
  );
}

async function clickConfirm(tree: any) {
  confirmButton(tree).props.onClick();
  await transitionPromise;
}

beforeEach(() => {
  pendingState = false;
  openState = false;
  transitionPromise = undefined;
  setOpen.mockClear();
  useState.mockClear();
  useTransition.mockClear();
  startTransition.mockClear();
  deleteAccount.mockClear();
  deleteAccount.mockImplementation(async () => ({ success: true }));
  signOut.mockClear();
  signOut.mockImplementation(async () => undefined);
  toastError.mockClear();
});

describe("DeleteAccountButton rendering", () => {
  test("passes controlled open state into the dialog", () => {
    openState = true;
    const tree = DeleteAccountButton({});
    const dialog = findOne(tree, (node) => node.type === DialogMock);
    expect(dialog.props.open).toBe(true);
    expect(dialog.props.onOpenChange).toBe(setOpen);
  });

  test("forwards custom size and class to the trigger", () => {
    const tree = DeleteAccountButton({ size: "lg", className: "danger" });
    const trigger = findOne(tree, (node) => node.type === DialogTriggerMock);
    expect(trigger.props.render.props.size).toBe("lg");
    expect(trigger.props.render.props.className).toBe("danger");
    expect(trigger.props.render.props.variant).toBe("destructive");
  });

  test("pending state disables trigger and confirmation", () => {
    pendingState = true;
    const tree = DeleteAccountButton({});
    const buttons = findAll(tree, (node) => node.type === ButtonMock);
    expect(buttons.every((button) => button.props.disabled === true)).toBe(true);
    expect(textContent(confirmButton(tree))).toBe("Deleting…");
  });
});

describe("DeleteAccountButton flow", () => {
  test("successful deletion closes the dialog and signs out to home", async () => {
    const tree = DeleteAccountButton({});
    await clickConfirm(tree);
    expect(deleteAccount).toHaveBeenCalledTimes(1);
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
    expect(toastError).not.toHaveBeenCalled();
  });

  test("action failure keeps the session and displays its message", async () => {
    deleteAccount.mockImplementation(async () => ({
      success: false,
      message: "Not allowed",
    }));
    await clickConfirm(DeleteAccountButton({}));
    expect(toastError).toHaveBeenCalledWith("Not allowed");
    expect(setOpen).not.toHaveBeenCalledWith(false);
    expect(signOut).not.toHaveBeenCalled();
  });

  test("action failure without a message uses a stable fallback", async () => {
    deleteAccount.mockImplementation(async () => ({ success: false }));
    await clickConfirm(DeleteAccountButton({}));
    expect(toastError).toHaveBeenCalledWith("Failed to delete account.");
  });

  test("thrown deletion errors are caught rather than escaping the transition", async () => {
    deleteAccount.mockImplementation(async () => {
      throw new Error("database unavailable");
    });
    await expect(clickConfirm(DeleteAccountButton({}))).resolves.toBeUndefined();
    expect(toastError).toHaveBeenCalledWith("Failed to delete account.");
    expect(signOut).not.toHaveBeenCalled();
  });

  test("sign-out failure does not misreport the already-completed deletion", async () => {
    signOut.mockImplementation(async () => {
      throw new Error("auth endpoint unavailable");
    });
    await expect(clickConfirm(DeleteAccountButton({}))).resolves.toBeUndefined();
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(toastError).toHaveBeenCalledWith(
      "Account deleted, but sign out failed. Please refresh.",
    );
  });
});
