import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Message01Icon,
  Link01Icon,
  Shield01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

export default async function HelpPage() {
  const session = await getServerSession(authOptions);
  let username: string | null = null;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { username: true },
    });
    username = user?.username ?? null;
  }

  const isOwner = !!username;

  return (
    <div className="page-stack">
      <div className="section-header">
        <h1 className="text-2xl font-semibold">Help & Guide</h1>
        <p className="text-sm text-muted-foreground">
          How to use Unsaid effectively.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="panel-card h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Link01Icon}
                size={18}
                className="text-muted-foreground"
                strokeWidth={2}
              />
              <div className="kicker">Getting Started</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>1. Claim your username:</strong> If you haven&apos;t already, go to your Account page to set a unique username.
            </p>
            <p>
              <strong>2. Share your link:</strong> Your inbox is accessible at <code>unsaid.com/yourname</code>. Share this link on your social media profiles, bio, or stories.
            </p>
            <p>
              <strong>3. Receive messages:</strong> Anyone with your link can send you a message. They do not need to have an account or be logged in. Messages are anonymous by default.
            </p>
          </CardContent>
        </Card>

        <Card className="panel-card h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Message01Icon}
                size={18}
                className="text-muted-foreground"
                strokeWidth={2}
              />
              <div className="kicker">Replies & Visibility</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Private by default:</strong> Messages sent to you are private. Only you can see them in your Inbox.
            </p>
            <p>
              <strong>Public replies:</strong> If you choose to reply to a message, that message and your reply become public on your profile page. This allows you to curate what appears on your public feed.
            </p>
            <p>
              <strong>Unreplied messages:</strong> Messages you don&apos;t reply to remain visible only to you.
            </p>
          </CardContent>
        </Card>

        <Card className="panel-card h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={UserIcon}
                size={18}
                className="text-muted-foreground"
                strokeWidth={2}
              />
              <div className="kicker">Anonymous Senders</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Unsaid allows unauthenticated users to send messages to your inbox. This lowers the barrier for honest feedback and thoughts.
            </p>
            <p>
              While we do not track sender identities for anonymous messages, we employ rate limiting and abuse filters to protect your inbox.
            </p>
          </CardContent>
        </Card>

        <Card className="panel-card h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Shield01Icon}
                size={18}
                className="text-muted-foreground"
                strokeWidth={2}
              />
              <div className="kicker">Safety & Moderation</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Hidden Words:</strong> You can define a list of words or phrases in your Account settings. Messages containing these words will be automatically blocked.
            </p>
            <p>
              <strong>Pause Inbox:</strong> Need a break? You can temporarily pause your inbox from the Account page. New messages will be rejected until the pause expires or you resume it manually.
            </p>
            <p>
              <strong>Close Inbox:</strong> You can close your inbox indefinitely if you no longer wish to receive messages.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}