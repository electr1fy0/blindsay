import { BASE_URL } from "@/config";
import type { Message, Reply } from "@/types";

export async function getMessages(): Promise<Message[]> {
  const resp = await fetch(`${BASE_URL}/ayush/messages`);
  console.log(`${BASE_URL}/ayush/messages`);

  if (!resp.ok) throw new Error("failed to fetch messages");
  const data = await resp.json();

  return data;
}

export async function replyToMessage(
  mid: number,
  replyContent: string,
): Promise<void> {
  const reply: Reply = { content: replyContent, messageId: mid };
  console.log(reply);
  const resp = await fetch(`${BASE_URL}/ayush/messages/replies`, {
    method: "POST",
    body: JSON.stringify(reply),
  });

  if (!resp.ok) throw new Error("failed to reply to message");
}
