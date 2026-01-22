import { useGetQuestions } from "./hooks/questions";

export function App() {
  const { data: questions = [], isLoading } = useGetQuestions();

  if (isLoading) return <div>Loading...</div>;
  return <div>resp: {JSON.stringify(questions)}</div>;
}

export default App;
