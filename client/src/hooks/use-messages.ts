import { getMessages, replyToMessage } from "@/api/messages";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useGetMessages() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: getMessages,
    retry: 2,
    staleTime: 30_000,
  });
}

export function useReplyToMessage() {
  return useMutation({
    mutationFn: ({
      mid: mid,
      content: content,
    }: {
      mid: number;
      content: string;
    }) => {
      return replyToMessage(mid, content);
    },
  });
}

export function useCreateMessage() {}

export function useGetReplies() {}
