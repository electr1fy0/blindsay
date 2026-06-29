"use server";

import { RESERVED_USERNAMES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

// TODO: think of such words someday
const blockedWords = ["slur1", "slur2", "hateword"];

function containsBlockedWords(content: string) {
  const normalized = content.toLowerCase();
  return blockedWords.some((word) => normalized.includes(word));
}

function normalizeHiddenWords(words: string[]) {
  return words
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 0);
}

function containsHiddenWords(content: string, words: string[]) {
  if (words.length === 0) return false;
  const normalized = content.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

export type ActionResponse = {
  success: boolean;
  message?: string;
};

const UNAUTHORIZED_RESPONSE: ActionResponse = {
  success: false,
  message: "You must be signed in.",
};

async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return user?.id ?? null;
}

export async function createAnonymousMessage(
  recipientId: string,
  recipientUsername: string,
  content: string,
): Promise<ActionResponse> {
  const rateLimitCheck = await checkRateLimit("send-message", 5, "60 s");
  if (rateLimitCheck && !rateLimitCheck.success) {
    return {
      success: false,
      message: "You're sending too fast. Please wait a moment before trying again.",
    };
  }

  if (!content || content.trim() === "") {
    return { success: false, message: "Content cannot be empty" };
  }

  if (containsBlockedWords(content)) {
    return { success: false, message: "Please remove abusive language." };
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { inboxOpen: true, inboxPausedUntil: true, hiddenWords: true },
  });

  if (!recipient) {
    return { success: false, message: "Recipient not found." };
  }

  const now = new Date();
  if (!recipient.inboxOpen) {
    return { success: false, message: "This inbox is currently closed." };
  }

  if (recipient.inboxPausedUntil && recipient.inboxPausedUntil > now) {
    return {
      success: false,
      message: "This inbox is temporarily paused. Please try again later.",
    };
  }

  const hiddenWords = normalizeHiddenWords(recipient.hiddenWords ?? []);
  if (containsHiddenWords(content, hiddenWords)) {
    return { success: false, message: "Your message contains a blocked word." };
  }

  await prisma.message.create({
    data: {
      content,
      recipientId,
    },
  });

  revalidatePath(`/${recipientUsername}`);
  return { success: true };
}

export async function createReplyMessage(
  recipientId: string,
  recipientUsername: string,
  parentId: string,
  content: string,
): Promise<ActionResponse> {
  const ownerId = await getAuthenticatedUserId();
  if (!ownerId) return UNAUTHORIZED_RESPONSE;

  if (ownerId !== recipientId) {
    return { success: false, message: "You cannot reply to this message." };
  }

  const existingReply = await prisma.message.findFirst({
    where: { recipientId, parentId },
    select: { id: true },
  });
  if (existingReply) {
    return { success: false, message: "Only one reply is allowed." };
  }

  if (!content || content.trim() === "") {
    return { success: false, message: "Content cannot be empty" };
  }

  await prisma.message.create({
    data: {
      content,
      recipientId,
      parentId,
    },
  });

  revalidatePath(`/${recipientUsername}`);
  return { success: true };
}

export async function updateReplyMessage(
  replyId: string,
  recipientUsername: string,
  content: string,
): Promise<ActionResponse> {
  const ownerId = await getAuthenticatedUserId();
  if (!ownerId) return UNAUTHORIZED_RESPONSE;

  if (!content || content.trim() === "") {
    return { success: false, message: "Content cannot be empty" };
  }

  const reply = await prisma.message.findUnique({
    where: { id: replyId },
    select: { recipientId: true, parentId: true },
  });

  if (!reply || !reply.parentId || reply.recipientId !== ownerId) {
    return { success: false, message: "You cannot edit this reply." };
  }

  await prisma.message.update({
    where: { id: replyId },
    data: { content },
  });

  revalidatePath(`/${recipientUsername}`);
  return { success: true };
}

export async function setUsername(username: string): Promise<ActionResponse> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return UNAUTHORIZED_RESPONSE;

  const normalized = username.trim().toLowerCase();
  if (RESERVED_USERNAMES.includes(normalized)) {
    return { success: false, message: "That username is reserved." };
  }

  if (!/^[a-z0-9_]{3,15}$/.test(normalized)) {
    return {
      success: false,
      message:
        "Username must be 3-15 characters and use letters, numbers, or underscores.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { username: normalized },
    select: { id: true },
  });
  if (existing && existing.id !== userId) {
    return { success: false, message: "That username is already taken." };
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { username: normalized },
  });

  redirect(`/${user.username}`);
}

export async function deleteMessage(
  messageId: string,
  recipientUsername: string,
): Promise<ActionResponse> {
  const ownerId = await getAuthenticatedUserId();
  if (!ownerId) return UNAUTHORIZED_RESPONSE;

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { recipientId: true, parentId: true },
  });

  if (!message || message.recipientId !== ownerId) {
    return { success: false, message: "You cannot delete this message." };
  }

  if (!message.parentId) {
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { parentId: messageId } }),
      prisma.message.delete({ where: { id: messageId } }),
    ]);
  } else {
    await prisma.message.delete({ where: { id: messageId } });
  }

  revalidatePath(`/${recipientUsername}`);
  return { success: true };
}

export async function updateHiddenWords(
  words: string[],
): Promise<ActionResponse> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return UNAUTHORIZED_RESPONSE;

  const normalized = normalizeHiddenWords(words);

  await prisma.user.update({
    where: { id: userId },
    data: { hiddenWords: normalized.slice(0, 50) },
  });

  revalidatePath("/account");
  return { success: true };
}

export async function pauseInbox(hours: number): Promise<ActionResponse> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return UNAUTHORIZED_RESPONSE;

  const safeHours = Math.max(1, Math.min(720, Math.floor(hours)));
  const pauseUntil = new Date(Date.now() + safeHours * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { inboxPausedUntil: pauseUntil },
  });

  revalidatePath("/account");
  return { success: true };
}

export async function clearInboxPause(): Promise<ActionResponse> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return UNAUTHORIZED_RESPONSE;

  await prisma.user.update({
    where: { id: userId },
    data: { inboxPausedUntil: null },
  });

  revalidatePath("/account");
  return { success: true };
}

export async function toggleInboxOpen(): Promise<ActionResponse> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return UNAUTHORIZED_RESPONSE;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { inboxOpen: true },
  });

  if (!user) return UNAUTHORIZED_RESPONSE;

  await prisma.user.update({
    where: { id: userId },
    data: { inboxOpen: !user.inboxOpen },
  });

  revalidatePath("/account");
  return { success: true };
}

export async function getUserSettings() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      image: true,
      inboxOpen: true,
      inboxPausedUntil: true,
      hiddenWords: true,
    },
  });
}
