import { createReply, getMessages } from "@/api/messages";
import type { CreateReplyRequest, Message } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const MESSAGES_QUERY_KEY = "messages";

export function useMessages(username: string) {
  return useQuery<Message[]>({
    queryKey: [MESSAGES_QUERY_KEY, username],
    queryFn: () => getMessages(username),
    retry: 2,
    staleTime: 30_000,
  });
}

export function useCreateReply(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateReplyRequest) => createReply(username, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MESSAGES_QUERY_KEY, username] });
    },
  });
}
