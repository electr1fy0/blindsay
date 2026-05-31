import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="page-stack mx-auto w-full max-w-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="section-header flex flex-col gap-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Top 2 Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="panel-card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 bg-muted-foreground/10" />
              <Skeleton className="h-3 w-10 bg-muted-foreground/10" />
            </div>
            <Skeleton className="h-9 w-16 bg-muted-foreground/15" />
            <Skeleton className="h-3 w-28 mt-2 bg-muted-foreground/10" />
          </div>
        ))}
      </div>

      {/* Chart Panel */}
      <div className="panel-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 bg-muted-foreground/15" />
            <Skeleton className="h-3.5 w-48 bg-muted-foreground/10" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-3.5 w-16 bg-muted-foreground/10" />
            <Skeleton className="h-3.5 w-16 bg-muted-foreground/10" />
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="panel-card-muted p-4 space-y-4">
              <Skeleton className="h-3.5 w-20 bg-muted-foreground/15" />
              <div className="flex items-end gap-1.5 h-24 pt-4">
                {Array.from({ length: 14 }).map((_, j) => (
                  <div key={j} className="flex flex-1 flex-col items-center gap-2">
                    <Skeleton 
                      className="w-full max-w-4 rounded-md bg-muted/60" 
                      style={{ height: `${20 + (j % 3 === 0 ? 40 : j % 2 === 0 ? 60 : 30)}px` }} 
                    />
                    <Skeleton className="h-2 w-full max-w-4 bg-muted-foreground/10" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom 3 Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="panel-card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 bg-muted-foreground/10" />
              <Skeleton className="h-3 w-10 bg-muted-foreground/10" />
            </div>
            <Skeleton className="h-9 w-16 bg-muted-foreground/15" />
            <Skeleton className="h-3 w-28 mt-2 bg-muted-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
