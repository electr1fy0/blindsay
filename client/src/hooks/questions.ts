import { getQuestions } from "@/api/questions";
import { useQuery } from "@tanstack/react-query";

export function useGetQuestions() {
  return useQuery({
    queryKey: ["questions"],
    queryFn: getQuestions,
    retry: 2,
    staleTime: 30_000,
  });
}
