import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-1 sm:px-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="section-header flex flex-col gap-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-7 w-7 rounded-full shrink-0" />
      </div>

      {/* Leave a note panel */}
      <div className="panel-card px-6 py-6 sm:px-7">
        <Skeleton className="h-4 w-24 mb-5" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      {/* Published replies header */}
      <div className="flex items-center justify-between gap-3 px-1">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>

      {/* Messages Skeleton List */}
      <div className="panel-card p-4 sm:p-5">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-b border-border/30 pb-6 mb-3 last:border-b-0 last:pb-0 last:mb-0 w-full">
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
    </div>
  );
}
