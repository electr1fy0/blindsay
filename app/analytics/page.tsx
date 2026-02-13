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
  const publicReplies = await prisma.message.aggregate({
    where: { recipientId: user.id, parentId: { not: null }, isPublic: true },
    _count: { id: true },
  });

  const days = 14;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const recent = await prisma.message.findMany({
    where: { recipientId: user.id, createdAt: { gte: start } },
    select: { createdAt: true, parentId: true, isPublic: true },
  });

  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      label: `${days - index - 1}d`,
      messages: 0,
      replies: 0,
      publicReplies: 0,
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
      if (item.isPublic) buckets[dayIndex].publicReplies += 1;
    } else {
      buckets[dayIndex].messages += 1;
    }
  }

  const maxMessages = Math.max(1, ...buckets.map((b) => b.messages));
  const maxReplies = Math.max(1, ...buckets.map((b) => b.replies));
  const maxPublic = Math.max(1, ...buckets.map((b) => b.publicReplies));

  return (
    <AppShell username={user.username} isOwner>
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Activity overview for your inbox.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4">
            <div className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Messages
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {messages._count.id}
            </div>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4">
            <div className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Replies
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {replies._count.id}
            </div>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-4">
            <div className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Public
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {publicReplies._count.id}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-foreground/10 bg-card/90 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Last 14 days</div>
            <div className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Messages
            </div>
          </div>
          <div className="mt-4 flex items-end gap-2">
            {buckets.map((bucket) => (
              <div key={bucket.label} className="flex flex-col items-center gap-2">
                <div
                  className="w-4 rounded-2xl bg-primary/80"
                  style={{ height: `${Math.max(8, (bucket.messages / maxMessages) * 72)}px` }}
                  title={`${bucket.messages} messages`}
                />
                <div className="text-[0.55rem] text-muted-foreground">
                  {bucket.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Replies</div>
              <div className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                Total
              </div>
            </div>
            <div className="mt-4 flex items-end gap-2">
              {buckets.map((bucket) => (
                <div key={bucket.label} className="flex flex-col items-center gap-2">
                  <div
                    className="w-4 rounded-2xl bg-foreground/60"
                    style={{ height: `${Math.max(8, (bucket.replies / maxReplies) * 72)}px` }}
                    title={`${bucket.replies} replies`}
                  />
                  <div className="text-[0.55rem] text-muted-foreground">
                    {bucket.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card/90 p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Public replies</div>
              <div className="text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                Visible
              </div>
            </div>
            <div className="mt-4 flex items-end gap-2">
              {buckets.map((bucket) => (
                <div key={bucket.label} className="flex flex-col items-center gap-2">
                  <div
                    className="w-4 rounded-2xl bg-muted-foreground/60"
                    style={{ height: `${Math.max(8, (bucket.publicReplies / maxPublic) * 72)}px` }}
                    title={`${bucket.publicReplies} public replies`}
                  />
                  <div className="text-[0.55rem] text-muted-foreground">
                    {bucket.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
