"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function createAnonymousMessage(
  recipientId: string,
  recipientUsername: string,
  content: string
) {
  if (!content || content.trim() === "") {
    throw new Error("Content cannot be empty");
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

  if (!content || content.trim() === "") {
    throw new Error("Content cannot be empty");
  }

  await prisma.message.create({
    data: {
      content,
      recipientId,
      parentId,
    },
  });

  revalidatePath(`/${recipientUsername}`);
}

export async function setUsername(username: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("You must be signed in.");
  }

  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
    throw new Error("Username must be 3-20 characters and use letters, numbers, or underscores.");
  }

  const existing = await prisma.user.findUnique({
    where: { username: normalized },
  });
  if (existing) {
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
