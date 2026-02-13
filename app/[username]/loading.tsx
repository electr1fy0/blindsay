import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingInbox() {
  return (
    <div className="min-h-screen">
      {/* Sidebar Skeleton */}
      <aside className="fixed left-4 top-4 hidden h-[calc(100vh-2rem)] w-60 md:flex">
        <div className="panel-card h-full w-full flex flex-col gap-4 px-4 py-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2 mt-4">
            <Skeleton className="h-9 w-full rounded-2xl" />
            <Skeleton className="h-9 w-full rounded-2xl" />
            <Skeleton className="h-9 w-full rounded-2xl" />
            <Skeleton className="h-9 w-full rounded-2xl" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="mx-auto flex max-w-6xl gap-6 px-5 py-8 md:pl-[18rem]">
        <main className="min-w-0 flex-1 space-y-6">
          {/* Mobile Nav Skeleton */}
          <div className="md:hidden panel-card px-4 py-3 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>

          {/* Header */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Main Action Area */}
          <div className="panel-card p-4">
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>

          {/* Message List */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="panel-card p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}