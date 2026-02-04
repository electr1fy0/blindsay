import { useGetMessages } from "./hooks/messages";
import { MessageItem } from "./components/message-item";

export function App() {
  const { data: messages = [], isLoading } = useGetMessages();
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
        {messages.map((m) => {
          return (
            <MessageItem
              key={m.id}
              content={m.content}
              id={m.id}
              reply={m.reply}
            ></MessageItem>
          );
        })}
      </div>
    </div>
  );
}

export default App;
