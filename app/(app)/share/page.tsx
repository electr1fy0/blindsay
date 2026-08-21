import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SharePanel } from "@/components/share-panel";
import { getProfileUrl } from "@/lib/site-url";

export default async function SharePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, username: true },
  });

  if (!user || !user.username) {
    redirect("/");
  }

  const shareUrl = getProfileUrl(user.username);

  return (
    <div className="page-stack mx-auto w-full max-w-2xl">
      <div className="section-header">
        <h1 className="text-2xl font-semibold">Share</h1>
        <p className="text-sm text-muted-foreground">
          Let people leave you honest, anonymous notes.
        </p>
      </div>
      <div className="mt-2">
        <SharePanel url={shareUrl} orientation="horizontal" />
      </div>
    </div>
  );
}
