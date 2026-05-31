import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="page-stack mx-auto w-full max-w-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="section-header flex flex-col gap-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Share Panel Loader */}
      <div className="panel-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3.5 w-24 bg-muted-foreground/15" />
          <Skeleton className="h-3.5 w-20 bg-muted-foreground/10" />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-3">
            <div className="panel-card-muted px-3 py-3 w-full">
              <Skeleton className="h-4 w-3/4 bg-muted-foreground/10" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28 rounded-md bg-muted/70" />
            </div>
          </div>
          <div className="panel-card-muted flex flex-col items-center justify-center p-3 w-full md:w-[240px] h-44 space-y-2 shrink-0">
            <Skeleton className="h-3 w-12 bg-muted-foreground/10" />
            <Skeleton className="h-28 w-28 rounded bg-muted-foreground/5" />
            <Skeleton className="h-3 w-20 bg-muted-foreground/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
