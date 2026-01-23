import { BASE_URL } from "@/config";
import type { Question, Reply } from "@/types";

export async function getQuestions(): Promise<Question[]> {
  const resp = await fetch(`${BASE_URL}/ayush/questions`);
  console.log(`${BASE_URL}/ayush/questions`);

  if (!resp.ok) throw new Error("failed to fetch questions");
  const data = await resp.json();

  return data;
}

export async function replyToQuestion(
  qid: string,
  replyContent: string,
): Promise<void> {
  const reply: Reply = { content: replyContent, questionId: qid };
  console.log(reply);
  const resp = await fetch(`${BASE_URL}/ayush/questions/replies`, {
    method: "POST",
    body: JSON.stringify(reply),
  });

  if (!resp.ok) throw new Error("failed to reply to question");
}
