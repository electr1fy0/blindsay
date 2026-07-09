import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-2 sm:px-4">
      <div className="grid gap-8 xl:gap-16 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="page-stack min-w-0">
          <div className="section-header">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>

          <div className="inline-flex w-fit items-center gap-1 rounded-full border border-border bg-muted/35 p-1 shadow-xs">
            <Skeleton className="h-7 w-14 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>

          <section className="flex flex-col gap-4">
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

            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-4 rounded-full border border-border bg-muted/15 px-4 py-1.5 shadow-2xs">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-3 w-1 bg-border" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-1 bg-border" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          </section>
        </div>

        <aside className="hidden xl:block xl:pl-6">
          <div className="sticky top-8">
            <div className="panel-card w-full p-4">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="mx-auto mb-4 h-40 w-40" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
