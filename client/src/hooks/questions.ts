import { getQuestions, replyToQuestion } from "@/api/questions";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useGetQuestions() {
  return useQuery({
    queryKey: ["questions"],
    queryFn: getQuestions,
    retry: 2,
    staleTime: 30_000,
  });
}

export function useReplyToQuestion() {
  return useMutation({
    mutationFn: ({
      qid: qid,
      content: content,
    }: {
      qid: string;
      content: string;
    }) => {
      return replyToQuestion(qid, content);
    },
  });
}

export function useCreateQuestion() {}

export function useGetReplies() {}
