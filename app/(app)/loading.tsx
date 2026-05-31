import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="page-stack mx-auto w-full max-w-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="section-header flex flex-col gap-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Generic Content Cards */}
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="panel-card p-5 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3 bg-muted-foreground/15" />
              <Skeleton className="h-3 w-1/2 bg-muted-foreground/10" />
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3.5 w-full bg-muted-foreground/10" />
              <Skeleton className="h-3.5 w-5/6 bg-muted-foreground/10" />
              <Skeleton className="h-3.5 w-2/3 bg-muted-foreground/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
