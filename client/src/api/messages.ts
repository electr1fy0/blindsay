import { apiRequest } from "@/lib/api-client";
import type { CreateReplyRequest, Message } from "@/types";

export async function getMessages(username: string): Promise<Message[]> {
  return apiRequest<Message[]>(`/${username}/messages`);
}

export async function createReply(
  username: string,
  request: CreateReplyRequest
): Promise<void> {
  await apiRequest<void>(`/${username}/messages/replies`, {
    method: "POST",
    body: request,
  });
}
