export default function LoadingAccount() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-6xl gap-6 px-5 py-8 md:pl-64">
        <main className="min-w-0 flex-1">
          <div className="panel-card p-4">
            <div className="h-4 w-32 rounded-full bg-muted/60" />
            <div className="mt-2 h-3 w-56 rounded-full bg-muted/50" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="panel-card p-4"
              >
                <div className="h-3 w-20 rounded-full bg-muted/60" />
                <div className="mt-3 h-6 w-16 rounded-full bg-muted/50" />
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="panel-card p-4"
              >
                <div className="h-3 w-24 rounded-full bg-muted/60" />
                <div className="mt-3 h-3 w-64 rounded-full bg-muted/50" />
                <div className="mt-2 h-3 w-48 rounded-full bg-muted/50" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
