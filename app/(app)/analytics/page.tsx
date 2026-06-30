import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/relative-time";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true },
  });

  if (!user) {
    redirect("/");
  }

  const days = 14;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const [messages, replies, latestMessage, latestReply, recent] = await Promise.all([
    prisma.message.aggregate({
      where: { recipientId: user.id, parentId: null },
      _count: { id: true },
    }),
    prisma.message.aggregate({
      where: { recipientId: user.id, parentId: { not: null } },
      _count: { id: true },
    }),
    prisma.message.findFirst({
      where: { recipientId: user.id, parentId: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.message.findFirst({
      where: { recipientId: user.id, parentId: { not: null } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.message.findMany({
      where: { recipientId: user.id, createdAt: { gte: start } },
      select: { createdAt: true, parentId: true },
      take: 1000,
    }),
  ]);

  const now = new Date();
  const latestMessageLabel = latestMessage
    ? formatRelativeTime(latestMessage.createdAt, now)
    : "—";
  const latestReplyLabel = latestReply
    ? formatRelativeTime(latestReply.createdAt, now)
    : "—";

  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      label: `${days - index - 1}d`,
      messages: 0,
      replies: 0,
    };
  });

  for (const item of recent) {
    const dayIndex = Math.floor(
      (new Date(item.createdAt).setHours(0, 0, 0, 0) - start.getTime()) /
        (24 * 60 * 60 * 1000)
    );
    if (dayIndex < 0 || dayIndex >= days) continue;
    if (item.parentId) {
      buckets[dayIndex].replies += 1;
    } else {
      buckets[dayIndex].messages += 1;
    }
  }

  const maxVal = Math.max(1, ...buckets.flatMap((b) => [b.messages, b.replies]));

  return (
    <div className="page-stack mx-auto w-full max-w-2xl">
      <div className="section-header">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Activity overview for your inbox.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Messages</div>
            <div className="kicker">Total</div>
          </div>
          <div className="mt-3 text-3xl font-semibold">
            {messages._count.id}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            All time received.
          </p>
        </div>
        <div className="panel-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Latest message</div>
            <div className="kicker">Recency</div>
          </div>
          <div className="mt-3 text-xl font-semibold">
            {latestMessageLabel}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Received
          </p>
        </div>
      </div>

      <div className="panel-card p-4 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Last 14 days</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Compare message volume and replies over time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary/40 border border-primary/25 backdrop-blur-xs shadow-3xs" />
              Messages
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-foreground/20 border border-foreground/15 backdrop-blur-xs shadow-3xs" />
              Replies
            </span>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="panel-card-muted p-3 sm:p-4">
            <div className="kicker">Messages</div>
            <div className="mt-4 overflow-x-auto no-scrollbar">
              <div className="flex w-full h-32 items-end justify-between gap-0.5 sm:gap-1 lg:gap-0.5">
                {buckets.map((bucket) => (
                  <div key={bucket.label} className="flex flex-1 flex-col items-center justify-end gap-1.5 sm:gap-2 min-w-[10px] sm:min-w-[18px] lg:min-w-[12px] h-full">
                    <div
                      className="w-full max-w-[14px] rounded-[3px] sm:rounded-md bg-primary/35 backdrop-blur-xs border border-primary/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)]"
                      style={{ height: `${Math.max(8, (bucket.messages / maxVal) * 96)}px` }}
                      title={`${bucket.messages} messages`}
                    />
                    <div className="w-full text-center text-[0.5rem] sm:text-[0.55rem] text-muted-foreground whitespace-nowrap">
                      {bucket.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="panel-card-muted p-3 sm:p-4">
            <div className="kicker">Replies</div>
            <div className="mt-4 overflow-x-auto no-scrollbar">
              <div className="flex w-full h-32 items-end justify-between gap-0.5 sm:gap-1 lg:gap-0.5">
                {buckets.map((bucket) => (
                  <div key={bucket.label} className="flex flex-1 flex-col items-center justify-end gap-1.5 sm:gap-2 min-w-[10px] sm:min-w-[18px] lg:min-w-[12px] h-full">
                    <div
                      className="w-full max-w-[14px] rounded-[3px] sm:rounded-md bg-foreground/20 backdrop-blur-xs border border-foreground/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                      style={{ height: `${Math.max(8, (bucket.replies / maxVal) * 96)}px` }}
                      title={`${bucket.replies} replies`}
                    />
                    <div className="w-full text-center text-[0.5rem] sm:text-[0.55rem] text-muted-foreground whitespace-nowrap">
                      {bucket.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-grid md:grid-cols-3">
        <div className="panel-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Replies total</div>
            <div className="kicker">All time</div>
          </div>
          <div className="mt-3 text-3xl font-semibold">
            {replies._count.id}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Total replies created in your inbox.
          </p>
        </div>
        <div className="panel-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Latest reply</div>
            <div className="kicker">Recency</div>
          </div>
          <div className="mt-3 text-xl font-semibold">
            {latestReplyLabel}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Published
          </p>
        </div>
        <div className="panel-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Response ratio</div>
            <div className="kicker">Replies</div>
          </div>
          <div className="mt-3 text-3xl font-semibold">
            {messages._count.id === 0
              ? "—"
              : `${Math.round(
                  (replies._count.id / messages._count.id) * 100
                )}%`}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Replies as a share of total messages.
          </p>
        </div>
      </div>
    </div>
  );
}
