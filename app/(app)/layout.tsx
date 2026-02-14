import { AppShell } from "@/components/app-shell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <AppShell user={session?.user}>
      {children}
    </AppShell>
  );
}
