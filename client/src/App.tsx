import { useState } from "react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { useGetQuestions, useReplyToQuestion } from "./hooks/questions";

export function App() {
  const { data: questions = [], isLoading } = useGetQuestions();
  const [reply, setReply] = useState<string>("");
  const { mutate: replyToQn } = useReplyToQuestion();
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex justify-center items-center flex-col min-h-screen">
      <header className="w-full max-w-lg my-8 mt-24">
        <h1 className="w-full max-w-lg  text-center text-3xl">Unsaid</h1>
        <h2 className="w-full max-w-lg text-neutral-500 text-center">
          Say unsaid things without fear
        </h2>
      </header>

      <div className="w-full max-w-lg">
        <h2 className="w-full max-w-lg text-neutral-700">
          Unanswered Messages
        </h2>
        {questions.map((q) => {
          return (
            <Card key={q.id} className="my-4">
              <CardHeader>{q.content}</CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    replyToQn({ qid: q.id!, content: reply });
                  }}
                >
                  <Input
                    type="text"
                    placeholder="Enter your reply..."
                    required
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  ></Input>

                  <Button type="submit" variant="default" className="mt-4">
                    Reply
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default App;
