import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-2 sm:px-4">
      <div className="grid gap-8 xl:gap-16 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="page-stack min-w-0 flex flex-col gap-6">
          {/* Header */}
          <div className="section-header flex flex-col gap-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>

          {/* Filter Toggles */}
          <div className="inline-flex w-fit items-center gap-1 rounded-full border border-border bg-muted/35 p-1 shadow-xs">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>

          {/* Messages Skeleton List */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="panel-card p-5 space-y-4">
                {/* Incoming Anonymous Bubble Skeleton */}
                <div className="flex flex-col gap-1.5 max-w-[88%] mr-auto w-full">
                  <div className="bg-muted/50 rounded-t-[1.15rem] rounded-r-[1.15rem] rounded-bl-[0.25rem] px-4.5 py-3 shadow-3xs w-full space-y-2">
                    <Skeleton className="h-3.5 w-3/4 bg-muted-foreground/15" />
                    <Skeleton className="h-3.5 w-1/2 bg-muted-foreground/15" />
                  </div>
                  <Skeleton className="h-2.5 w-16 mt-1 ml-2 bg-muted-foreground/10" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Skeleton (Matching SharePanel) */}
        <aside className="hidden xl:block xl:pl-6">
          <div className="sticky top-8 space-y-6">
            <div className="panel-card p-6 sm:p-7 space-y-5 flex flex-col">
              <Skeleton className="h-4 w-28 bg-muted-foreground/10" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-full bg-muted/60" />
              </div>
              <div className="grid grid-cols-4 gap-2 pt-2">
                <Skeleton className="h-9 rounded-md bg-muted/60" />
                <Skeleton className="h-9 rounded-md bg-muted/60" />
                <Skeleton className="h-9 rounded-md bg-muted/60" />
                <Skeleton className="h-9 rounded-md bg-muted/60" />
              </div>
              {/* Vertical QR Code Card Loader */}
              <div className="panel-card-muted flex flex-col items-center justify-center p-3 w-fit self-center px-6 h-40 space-y-2 mt-2">
                <Skeleton className="h-3 w-12 bg-muted-foreground/10" />
                <Skeleton className="h-24 w-24 rounded bg-muted-foreground/5" />
                <Skeleton className="h-3 w-20 bg-muted-foreground/10" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
