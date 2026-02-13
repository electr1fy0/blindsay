"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

const blockedWords = ["slur1", "slur2", "hateword"];

async function getClientIp() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headerList.get("x-real-ip") ?? "unknown";
}

function containsBlockedWords(content: string) {
  const normalized = content.toLowerCase();
  return blockedWords.some((word) => normalized.includes(word));
}

export async function createAnonymousMessage(
  recipientId: string,
  recipientUsername: string,
  content: string
) {
  if (!content || content.trim() === "") {
    throw new Error("Content cannot be empty");
  }

  if (containsBlockedWords(content)) {
    throw new Error("Please remove abusive language.");
  }

  const ip = await getClientIp();
  const limit = checkRateLimit(`msg:${ip}:${recipientId}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    throw new Error("Too many messages. Please try again later.");
  }

  await prisma.message.create({
    data: {
      content,
      recipientId,
    },
  });

  revalidatePath(`/${recipientUsername}`);
}

export async function createReplyMessage(
  recipientId: string,
  recipientUsername: string,
  parentId: string,
  content: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("You must be signed in.");
  }

  const owner = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!owner || owner.id !== recipientId) {
    throw new Error("You cannot reply to this message.");
  }

  const existingReply = await prisma.message.findFirst({
    where: { recipientId, parentId },
    select: { id: true },
  });
  if (existingReply) {
    throw new Error("Only one reply is allowed.");
  }

  if (!content || content.trim() === "") {
    throw new Error("Content cannot be empty");
  }

  await prisma.message.create({
    data: {
      content,
      recipientId,
      parentId,
      isPublic: true,
    },
  });

  revalidatePath(`/${recipientUsername}`);
}

export async function updateReplyMessage(
  replyId: string,
  recipientUsername: string,
  content: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("You must be signed in.");
  }

  const owner = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!owner) {
    throw new Error("You must be signed in.");
  }

  if (!content || content.trim() === "") {
    throw new Error("Content cannot be empty");
  }

  const reply = await prisma.message.findUnique({
    where: { id: replyId },
    select: { recipientId: true, parentId: true },
  });

  if (!reply || !reply.parentId || reply.recipientId !== owner.id) {
    throw new Error("You cannot edit this reply.");
  }

  await prisma.message.update({
    where: { id: replyId },
    data: { content },
  });

  revalidatePath(`/${recipientUsername}`);
}

export async function reportMessage(messageId: string, reason: string) {
  const safeReason = reason.trim().slice(0, 200);
  if (!safeReason) {
    throw new Error("Please include a reason.");
  }
  const ip = await getClientIp();

  const limit = checkRateLimit(`report:${ip}`, 3, 10 * 60 * 1000);
  if (!limit.ok) {
    throw new Error("Too many reports. Please try again later.");
  }

  await prisma.messageReport.create({
    data: {
      messageId,
      reason: safeReason,
      ip,
    },
  });
}

export async function setUsername(username: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("You must be signed in.");
  }

  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,15}$/.test(normalized)) {
    throw new Error(
      "Username must be 3-15 characters and use letters, numbers, or underscores."
    );
  }

  const existing = await prisma.user.findUnique({
    where: { username: normalized },
    select: { email: true },
  });
  if (existing && existing.email !== session.user.email) {
    throw new Error("That username is already taken.");
  }

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { username: normalized },
  });

  redirect(`/${user.username}`);
}

export async function updatePublicReplyLimit(limit: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("You must be signed in.");
  }

  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));

  await prisma.user.update({
    where: { email: session.user.email },
    data: { publicReplyLimit: safeLimit },
  });

  redirect("/account");
}

export async function deleteMessage(messageId: string, recipientUsername: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("You must be signed in.");
  }

  const owner = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!owner) {
    throw new Error("You must be signed in.");
  }

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { recipientId: true, parentId: true },
  });

  if (!message || message.recipientId !== owner.id) {
    throw new Error("You cannot delete this message.");
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
}

export async function toggleInboxOpen() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("You must be signed in.");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { inboxOpen: true },
  });

  if (!user) {
    throw new Error("You must be signed in.");
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { inboxOpen: !user.inboxOpen },
  });

  redirect("/account");
}
