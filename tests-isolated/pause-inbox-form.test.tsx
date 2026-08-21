import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, findOne, textContent } from "./react-tree";

let valueState = "6";
let pausePending = false;
let clearPending = false;
let transitionIndex = 0;
let transitionPromise: Promise<unknown> | undefined;

const setValue = mock((_value: string) => {});
const useState = mock((_initial: any) => [valueState, setValue]);
const startPause = mock((callback: () => unknown) => {
  transitionPromise = Promise.resolve(callback());
});
const startClear = mock((callback: () => unknown) => {
  transitionPromise = Promise.resolve(callback());
});
const useTransition = mock(() => {
  const current = transitionIndex++;
  return current === 0 ? [pausePending, startPause] : [clearPending, startClear];
});
const pauseInbox = mock(async (_hours: number) => ({ success: true } as any));
const clearInboxPause = mock(async () => ({ success: true } as any));
const toastSuccess = mock((_message: string) => {});
const toastError = mock((_message: string) => {});

const ButtonMock = (_props: any) => null;
const SelectMock = (_props: any) => null;
const SelectContentMock = (_props: any) => null;
const SelectItemMock = (_props: any) => null;
const SelectTriggerMock = (_props: any) => null;
const SelectValueMock = (_props: any) => null;

mock.module("react", () => ({ useState, useTransition }));
mock.module("@/app/actions", () => ({ pauseInbox, clearInboxPause }));
mock.module("sonner", () => ({
  toast: Object.assign(toastSuccess, { error: toastError }),
}));
mock.module("@/components/ui/button", () => ({ Button: ButtonMock }));
mock.module("@/components/ui/select", () => ({
  Select: SelectMock,
  SelectContent: SelectContentMock,
  SelectItem: SelectItemMock,
  SelectTrigger: SelectTriggerMock,
  SelectValue: SelectValueMock,
}));

const { PauseInboxForm } = await import("../components/pause-inbox-form");

function render(isPaused = false) {
  transitionIndex = 0;
  return PauseInboxForm({ isPaused });
}

async function submit(tree: any) {
  const form = findOne(tree, (node) => node.type === "form");
  const preventDefault = mock(() => {});
  form.props.onSubmit({ preventDefault });
  await transitionPromise;
  return preventDefault;
}

beforeEach(() => {
  valueState = "6";
  pausePending = false;
  clearPending = false;
  transitionIndex = 0;
  transitionPromise = undefined;
  setValue.mockClear();
  useState.mockClear();
  useTransition.mockClear();
  startPause.mockClear();
  startClear.mockClear();
  pauseInbox.mockClear();
  pauseInbox.mockImplementation(async () => ({ success: true }));
  clearInboxPause.mockClear();
  clearInboxPause.mockImplementation(async () => ({ success: true }));
  toastSuccess.mockClear();
  toastError.mockClear();
});

describe("unpaused inbox controls", () => {
  test("defaults to the six-hour pause option", () => {
    const tree = render(false);
    const select = findOne(tree, (node) => node.type === SelectMock);
    expect(select.props.value).toBe("6");
  });

  test("renders all supported pause choices", () => {
    const tree = render(false);
    const items = findAll(tree, (node) => node.type === SelectItemMock);
    expect(items.map((item) => item.props.value)).toEqual([
      "1",
      "6",
      "12",
      "24",
      "72",
      "168",
    ]);
    expect(items.map(textContent)).toEqual([
      "1 hour",
      "6 hours",
      "12 hours",
      "24 hours",
      "72 hours",
      "168 hours",
    ]);
  });

  test("updates selection while ignoring a nullish next value", () => {
    const tree = render(false);
    const select = findOne(tree, (node) => node.type === SelectMock);
    select.props.onValueChange("24");
    expect(setValue).toHaveBeenCalledWith("24");
    select.props.onValueChange(null);
    expect(setValue).toHaveBeenLastCalledWith("6");
  });

  test("submits the selected duration as a number", async () => {
    valueState = "72";
    const preventDefault = await submit(render(false));
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(pauseInbox).toHaveBeenCalledWith(72);
    expect(toastSuccess).toHaveBeenCalledWith("Inbox paused.");
  });

  test("uses the server failure message without a success toast", async () => {
    pauseInbox.mockImplementation(async () => ({
      success: false,
      message: "Cannot pause now",
    }));
    await submit(render(false));
    expect(toastError).toHaveBeenCalledWith("Cannot pause now");
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  test("uses a fallback when the server omits its failure message", async () => {
    pauseInbox.mockImplementation(async () => ({ success: false }));
    await submit(render(false));
    expect(toastError).toHaveBeenCalledWith("Failed to pause inbox.");
  });

  test("catches thrown pause failures", async () => {
    pauseInbox.mockImplementation(async () => {
      throw new Error("network failure");
    });
    await expect(submit(render(false))).resolves.toBeDefined();
    expect(toastError).toHaveBeenCalledWith("Failed to pause inbox.");
  });

  test("pending state disables pause and changes its label", () => {
    pausePending = true;
    const tree = render(false);
    const button = findOne(tree, (node) => node.type === ButtonMock);
    expect(button.props.disabled).toBe(true);
    expect(textContent(button)).toBe("Pausing...");
  });
});

describe("paused inbox controls", () => {
  test("renders only the resume control", () => {
    const tree = render(true);
    expect(findAll(tree, (node) => node.type === SelectMock)).toHaveLength(0);
    expect(textContent(findOne(tree, (node) => node.type === ButtonMock))).toBe("Resume");
  });

  test("successful resume clears the pause and shows confirmation", async () => {
    const preventDefault = await submit(render(true));
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(clearInboxPause).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("Inbox resumed.");
  });

  test("resume failure displays the action message", async () => {
    clearInboxPause.mockImplementation(async () => ({
      success: false,
      message: "Cannot resume",
    }));
    await submit(render(true));
    expect(toastError).toHaveBeenCalledWith("Cannot resume");
  });

  test("resume failure falls back when the message is absent", async () => {
    clearInboxPause.mockImplementation(async () => ({ success: false }));
    await submit(render(true));
    expect(toastError).toHaveBeenCalledWith("Failed to resume inbox.");
  });

  test("catches thrown resume failures", async () => {
    clearInboxPause.mockImplementation(async () => {
      throw new Error("backend offline");
    });
    await expect(submit(render(true))).resolves.toBeDefined();
    expect(toastError).toHaveBeenCalledWith("Failed to resume inbox.");
  });

  test("clearing state disables resume and changes its label", () => {
    clearPending = true;
    const tree = render(true);
    const button = findOne(tree, (node) => node.type === ButtonMock);
    expect(button.props.disabled).toBe(true);
    expect(textContent(button)).toBe("Resuming...");
  });
});
