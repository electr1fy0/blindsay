import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, username: true },
  });

  if (!user) {
    redirect("/");
  }

  const messages = await prisma.message.aggregate({
    where: { recipientId: user.id, parentId: null },
    _count: { id: true },
  });
  const replies = await prisma.message.aggregate({
    where: { recipientId: user.id, parentId: { not: null } },
    _count: { id: true },
  });

  const days = 14;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const recent = await prisma.message.findMany({
    where: { recipientId: user.id, createdAt: { gte: start } },
    select: { createdAt: true, parentId: true },
  });

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

  const maxMessages = Math.max(1, ...buckets.map((b) => b.messages));
  const maxReplies = Math.max(1, ...buckets.map((b) => b.replies));

  return (
    <AppShell username={user.username} isOwner>
      <div className="page-stack">
        <div className="section-header">
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Activity overview for your inbox.
          </p>
        </div>
        <div className="section-grid md:grid-cols-2">
          <div className="panel-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Messages received</div>
              <div className="kicker">Total</div>
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {messages._count.id}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Notes sent to your inbox.
            </p>
          </div>
          <div className="panel-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Replies published</div>
              <div className="kicker">Total</div>
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {replies._count.id}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Replies posted in your inbox.
            </p>
          </div>
        </div>

        <div className="panel-card p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold">Last 14 days</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Compare message volume and replies over time.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary/80" />
                Messages
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-foreground/60" />
                Replies
              </span>
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="panel-card-muted p-4">
              <div className="kicker">Messages</div>
              <div className="mt-4 flex items-end gap-1">
                {buckets.map((bucket) => (
                  <div key={bucket.label} className="flex flex-1 flex-col items-center gap-2 min-w-0">
                    <div
                      className="w-full max-w-4 rounded-2xl bg-primary/80"
                      style={{ height: `${Math.max(8, (bucket.messages / maxMessages) * 96)}px` }}
                      title={`${bucket.messages} messages`}
                    />
                    <div className="w-full text-center text-[0.55rem] text-muted-foreground truncate">
                      {bucket.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel-card-muted p-4">
              <div className="kicker">Replies</div>
              <div className="mt-4 flex items-end gap-1">
                {buckets.map((bucket) => (
                  <div key={bucket.label} className="flex flex-1 flex-col items-center gap-2 min-w-0">
                    <div
                      className="w-full max-w-4 rounded-2xl bg-foreground/60"
                      style={{ height: `${Math.max(8, (bucket.replies / maxReplies) * 96)}px` }}
                      title={`${bucket.replies} replies`}
                    />
                    <div className="w-full text-center text-[0.55rem] text-muted-foreground truncate">
                      {bucket.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="section-grid md:grid-cols-2">
          <div className="panel-card p-5">
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
          <div className="panel-card p-5">
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
    </AppShell>
  );
}
