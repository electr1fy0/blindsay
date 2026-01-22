import { BASE_URL } from "@/config";
import type { Question } from "@/types";

export async function getQuestions(): Promise<Question[]> {
  const resp = await fetch(`${BASE_URL}/ayush/questions`);
  console.log(`${BASE_URL}/ayush/questions`);

  if (!resp.ok) throw new Error("failed to fetch questions");
  const data = await resp.json();

  return data;
}
