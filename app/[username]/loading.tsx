export default function LoadingInbox() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-6xl gap-6 px-5 py-8 md:pl-64">
        <main className="min-w-0 flex-1">
          <div className="panel-card p-4">
            <div className="h-4 w-40 rounded-full bg-muted/60" />
            <div className="mt-3 h-3 w-64 rounded-full bg-muted/50" />
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="panel-card-subtle px-5 py-5"
              >
                <div className="h-3 w-24 rounded-full bg-muted/60" />
                <div className="mt-3 h-3 w-full rounded-full bg-muted/50" />
                <div className="mt-2 h-3 w-5/6 rounded-full bg-muted/50" />
                <div className="mt-4 h-10 w-full rounded-2xl bg-muted/30" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
