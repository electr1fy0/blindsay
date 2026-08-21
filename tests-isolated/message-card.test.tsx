import { beforeEach, describe, expect, mock, test } from "bun:test";
import { findAll, findOne, textContent } from "./react-tree";

let editingState = false;
let currentReplyState: any = null;
let editValueState = "";
let pendingState = false;
let stateIndex = 0;
let transitionPromise: Promise<unknown> | undefined;
const effects: Array<() => void | (() => void)> = [];

const setIsEditing = mock((_value: boolean) => {});
const setCurrentReply = mock((_value: any) => {});
const setEditValue = mock((_value: string) => {});
const useState = mock((_initial: any) => {
  const index = stateIndex++;
  if (index === 0) return [editingState, setIsEditing];
  if (index === 1) return [currentReplyState, setCurrentReply];
  return [editValueState, setEditValue];
});
const startTransition = mock((callback: () => unknown) => {
  transitionPromise = Promise.resolve(callback());
});
const useTransition = mock(() => [pendingState, startTransition]);
const useEffect = mock((effect: () => void | (() => void)) => {
  effects.push(effect);
  effect();
});
const updateReplyMessage = mock(async (..._args: any[]) => ({ success: true } as any));
const formatRelativeTime = mock((_date: Date, _now: Date) => "relative");
const refresh = mock(() => {});
const useRouter = mock(() => ({ refresh }));
const toastSuccess = mock((_message: string) => {});
const toastError = mock((_message: string) => {});

const ButtonMock = (_props: any) => null;
const TextareaMock = (_props: any) => null;
const DeleteMessageButtonMock = (_props: any) => null;
const ShareMessageButtonMock = (_props: any) => null;
const NewBadgeMock = (_props: any) => null;
const HugeiconsIconMock = (_props: any) => null;
const ReplyFormMock = (_props: any) => null;
const MotionDivMock = (_props: any) => null;
const AnimatePresenceMock = (_props: any) => null;

mock.module("react", () => ({ useState, useTransition, useEffect }));
mock.module("@/app/actions", () => ({ updateReplyMessage }));
mock.module("@/lib/relative-time", () => ({ formatRelativeTime }));
mock.module("next/navigation", () => ({ useRouter }));
mock.module("sonner", () => ({
  toast: { success: toastSuccess, error: toastError },
}));
mock.module("@/components/ui/button", () => ({ Button: ButtonMock }));
mock.module("@/components/ui/textarea", () => ({ Textarea: TextareaMock }));
mock.module("@/components/message-actions", () => ({
  DeleteMessageButton: DeleteMessageButtonMock,
}));
mock.module("@/components/share-message-button", () => ({
  ShareMessageButton: ShareMessageButtonMock,
}));
mock.module("@/components/new-badge", () => ({ NewBadge: NewBadgeMock }));
mock.module("@hugeicons/react", () => ({ HugeiconsIcon: HugeiconsIconMock }));
mock.module("@hugeicons/core-free-icons", () => ({ Edit01Icon: {} }));
mock.module("motion/react", () => ({
  motion: { div: MotionDivMock },
  AnimatePresence: AnimatePresenceMock,
}));
mock.module("@/components/reply-form", () => ({ ReplyForm: ReplyFormMock }));
mock.module("@/lib/generated/prisma/models", () => ({}));

const { MessageCard } = await import("../components/message-card");

const now = new Date("2026-08-21T00:00:00Z");
const message = {
  id: "message-1",
  content: "anonymous content",
  createdAt: new Date("2026-08-20T00:00:00Z"),
  deletedAt: null,
  parentId: null,
  recipientId: "owner-from-message",
};
const reply = {
  id: "reply-1",
  content: "original reply",
  createdAt: new Date("2026-08-20T01:00:00Z"),
  deletedAt: null,
  parentId: "message-1",
  recipientId: "owner-from-message",
};

function render(props: any = {}) {
  stateIndex = 0;
  return MessageCard({
    message: message as any,
    now,
    recipientUsername: "alice",
    ...props,
  });
}

function resetStateFromReply(value: any = null) {
  currentReplyState = value;
  editValueState = value?.content ?? "";
}

beforeEach(() => {
  editingState = false;
  resetStateFromReply(null);
  pendingState = false;
  stateIndex = 0;
  transitionPromise = undefined;
  effects.length = 0;
  setIsEditing.mockClear();
  setCurrentReply.mockClear();
  setEditValue.mockClear();
  startTransition.mockClear();
  useEffect.mockClear();
  updateReplyMessage.mockClear();
  updateReplyMessage.mockImplementation(async () => ({ success: true }));
  formatRelativeTime.mockClear();
  formatRelativeTime.mockImplementation(() => "relative");
  refresh.mockClear();
  toastSuccess.mockClear();
  toastError.mockClear();
});

describe("message visibility and ownership", () => {
  test("always renders anonymous message content and timestamp", () => {
    const tree = render();
    expect(textContent(tree)).toContain("anonymous content");
    expect(textContent(tree)).toContain("relative");
    expect(formatRelativeTime).toHaveBeenCalledWith(message.createdAt, now);
  });

  test("visitor without a reply sees no owner controls or reply form", () => {
    const tree = render({ isOwner: false });
    expect(findAll(tree, (node) => node.type === NewBadgeMock)).toHaveLength(0);
    expect(findAll(tree, (node) => node.type === DeleteMessageButtonMock)).toHaveLength(0);
    expect(findAll(tree, (node) => node.type === ReplyFormMock)).toHaveLength(0);
  });

  test("owner without a reply sees new badge, root delete, and reply form", () => {
    const tree = render({ isOwner: true, recipientId: "explicit-owner" });
    expect(findOne(tree, (node) => node.type === NewBadgeMock).props.messageId).toBe("message-1");
    const deletes = findAll(tree, (node) => node.type === DeleteMessageButtonMock);
    expect(deletes).toHaveLength(1);
    expect(deletes[0].props.messageId).toBe("message-1");
    const form = findOne(tree, (node) => node.type === ReplyFormMock);
    expect(form.props.recipientId).toBe("explicit-owner");
    expect(form.props.parentId).toBe("message-1");
    expect(form.props.recipientUsername).toBe("alice");
  });

  test("ReplyForm falls back to message recipient id when prop is absent", () => {
    const tree = render({ isOwner: true });
    expect(findOne(tree, (node) => node.type === ReplyFormMock).props.recipientId).toBe(
      "owner-from-message",
    );
  });

  test("ReplyForm falls back to empty recipient id if both sources are absent", () => {
    const noRecipientMessage = { ...message, recipientId: null };
    const tree = render({ isOwner: true, message: noRecipientMessage as any });
    expect(findOne(tree, (node) => node.type === ReplyFormMock).props.recipientId).toBe("");
  });
});

describe("existing reply rendering", () => {
  beforeEach(() => resetStateFromReply(reply));

  test("visitor sees reply and share control but no owner edit/delete controls", () => {
    const tree = render({ reply: reply as any, isOwner: false });
    expect(textContent(tree)).toContain("original reply");
    expect(findAll(tree, (node) => node.type === ShareMessageButtonMock)).toHaveLength(1);
    expect(findAll(tree, (node) => node.type === DeleteMessageButtonMock)).toHaveLength(0);
    expect(findAll(tree, (node) => node.type === "button" && node.props.title === "Edit reply")).toHaveLength(0);
  });

  test("share card receives exact message, reply, and username", () => {
    const tree = render({ reply: reply as any });
    const share = findOne(tree, (node) => node.type === ShareMessageButtonMock);
    expect(share.props.messageContent).toBe("anonymous content");
    expect(share.props.replyContent).toBe("original reply");
    expect(share.props.username).toBe("alice");
  });

  test("owner sees root delete, reply delete, and edit control", () => {
    const tree = render({ reply: reply as any, isOwner: true });
    const deletes = findAll(tree, (node) => node.type === DeleteMessageButtonMock);
    expect(deletes.map((node) => node.props.messageId)).toEqual(["message-1", "reply-1"]);
    expect(findAll(tree, (node) => node.type === "button" && node.props.title === "Edit reply")).toHaveLength(1);
  });

  test("formats reply timestamp against same supplied now", () => {
    render({ reply: reply as any });
    expect(formatRelativeTime).toHaveBeenCalledWith(reply.createdAt, now);
  });

  test("reply delete success immediately removes current reply state", () => {
    const tree = render({ reply: reply as any, isOwner: true });
    const replyDelete = findAll(tree, (node) => node.type === DeleteMessageButtonMock).find(
      (node) => node.props.messageId === "reply-1",
    )!;
    replyDelete.props.onSuccess();
    expect(setCurrentReply).toHaveBeenCalledWith(null);
  });
});

describe("prop synchronization", () => {
  test("effect synchronizes currentReply and editValue from a reply prop", () => {
    render({ reply: reply as any });
    expect(useEffect).toHaveBeenCalledTimes(1);
    expect(setCurrentReply).toHaveBeenCalledWith(reply);
    expect(setEditValue).toHaveBeenCalledWith("original reply");
  });

  test("effect clears current reply and edit buffer when reply prop disappears", () => {
    resetStateFromReply(reply);
    render({ reply: null });
    expect(setCurrentReply).toHaveBeenCalledWith(null);
    expect(setEditValue).toHaveBeenCalledWith("");
  });
});

describe("reply creation callback", () => {
  test("ReplyForm success installs the newly-created reply", () => {
    const tree = render({ isOwner: true });
    const newReply = { ...reply, id: "reply-new" };
    findOne(tree, (node) => node.type === ReplyFormMock).props.onSuccess(newReply);
    expect(setCurrentReply).toHaveBeenCalledWith(newReply);
  });
});

describe("edit mode", () => {
  beforeEach(() => {
    resetStateFromReply(reply);
  });

  test("edit button seeds edit buffer and enters edit mode", () => {
    const tree = render({ reply: reply as any, isOwner: true });
    const edit = findOne(tree, (node) => node.type === "button" && node.props.title === "Edit reply");
    edit.props.onClick();
    expect(setEditValue).toHaveBeenCalledWith("original reply");
    expect(setIsEditing).toHaveBeenCalledWith(true);
  });

  test("pending state disables edit button", () => {
    pendingState = true;
    const tree = render({ reply: reply as any, isOwner: true });
    expect(findOne(tree, (node) => node.type === "button" && node.props.title === "Edit reply").props.disabled).toBe(true);
  });

  test("editing mode hides share controls and renders textarea", () => {
    editingState = true;
    const tree = render({ reply: reply as any, isOwner: true });
    expect(findOne(tree, (node) => node.type === TextareaMock).props.value).toBe("original reply");
    expect(findAll(tree, (node) => node.type === ShareMessageButtonMock)).toHaveLength(0);
  });

  test("edit input clips at 4000 characters", () => {
    editingState = true;
    const tree = render({ reply: reply as any, isOwner: true });
    findOne(tree, (node) => node.type === TextareaMock).props.onChange({
      target: { value: "x".repeat(4100) },
    });
    expect(setEditValue).toHaveBeenCalledWith("x".repeat(4000));
  });

  test("blank edit disables Save", () => {
    editingState = true;
    editValueState = " \n ";
    const tree = render({ reply: reply as any, isOwner: true });
    const save = findOne(tree, (node) => node.type === ButtonMock && textContent(node) === "Save");
    expect(save.props.disabled).toBe(true);
  });

  test("pending edit disables textarea, Save, and Cancel", () => {
    editingState = true;
    pendingState = true;
    const tree = render({ reply: reply as any, isOwner: true });
    expect(findOne(tree, (node) => node.type === TextareaMock).props.disabled).toBe(true);
    const buttons = findAll(tree, (node) => node.type === ButtonMock);
    expect(buttons.every((node) => node.props.disabled === true)).toBe(true);
  });

  test("Cancel exits edit mode and restores current reply content", () => {
    editingState = true;
    editValueState = "dirty edit";
    const tree = render({ reply: reply as any, isOwner: true });
    const cancel = findOne(tree, (node) => node.type === ButtonMock && textContent(node) === "Cancel");
    cancel.props.onClick();
    expect(setIsEditing).toHaveBeenCalledWith(false);
    expect(setEditValue).toHaveBeenCalledWith("original reply");
  });
});

describe("saving reply edits", () => {
  beforeEach(() => {
    editingState = true;
    resetStateFromReply(reply);
    editValueState = "edited reply";
  });

  async function save(tree: any) {
    const button = findOne(tree, (node) => node.type === ButtonMock && textContent(node) === "Save");
    button.props.onClick();
    await transitionPromise;
  }

  test("submits exact reply id, username, and edit buffer", async () => {
    await save(render({ reply: reply as any, isOwner: true }));
    expect(updateReplyMessage).toHaveBeenCalledWith("reply-1", "alice", "edited reply");
  });

  test("success exits edit mode, installs optimistic reply, refreshes, and toasts", async () => {
    await save(render({ reply: reply as any, isOwner: true }));
    expect(setIsEditing).toHaveBeenCalledWith(false);
    expect(setCurrentReply).toHaveBeenCalledWith({ ...reply, content: "edited reply" });
    expect(toastSuccess).toHaveBeenCalledWith("Updated.");
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(toastError).not.toHaveBeenCalled();
  });

  test("declared failure displays server message without optimistic changes", async () => {
    updateReplyMessage.mockImplementation(async () => ({
      success: false,
      message: "Cannot edit this reply",
    }));
    await save(render({ reply: reply as any, isOwner: true }));
    expect(toastError).toHaveBeenCalledWith("Cannot edit this reply");
    expect(setIsEditing).not.toHaveBeenCalledWith(false);
    expect(refresh).not.toHaveBeenCalled();
  });

  test("declared failure without message uses fallback", async () => {
    updateReplyMessage.mockImplementation(async () => ({ success: false }));
    await save(render({ reply: reply as any, isOwner: true }));
    expect(toastError).toHaveBeenCalledWith("Failed to save reply.");
  });

  test("thrown edit failure is contained and uses fallback", async () => {
    updateReplyMessage.mockImplementation(async () => {
      throw new Error("database unavailable");
    });
    await expect(save(render({ reply: reply as any, isOwner: true }))).resolves.toBeUndefined();
    expect(toastError).toHaveBeenCalledWith("Failed to save reply.");
    expect(refresh).not.toHaveBeenCalled();
  });
});
