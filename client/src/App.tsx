import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { useGetQuestions } from "./hooks/questions";

export function App() {
  const { data: questions = [], isLoading } = useGetQuestions();

  if (isLoading) return <div>Loading...</div>;
  const handleSubmit = () => {};
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
                <form onSubmit={handleSubmit}>
                  <Input
                    type="text"
                    placeholder="Enter your reply..."
                    required
                  ></Input>
                </form>
              </CardContent>
              <CardFooter>
                <Button type="submit" variant="default" className="hov">
                  Reply
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default App;
