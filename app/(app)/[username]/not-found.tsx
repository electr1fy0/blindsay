import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";

export default function UsernameNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="panel-card mx-auto max-w-md px-8 py-12 text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-muted/50">
          <HugeiconsIcon
            icon={UserIcon}
            size={24}
            className="text-muted-foreground"
            strokeWidth={2}
          />
        </div>
        <p className="kicker mb-2">Not found</p>
        <h1 className="mb-2 text-xl font-semibold">This user doesn&apos;t exist</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          The link you followed might be broken, or the person hasn&apos;t
          claimed their username yet.
        </p>
        <Link
          href="/"
          className="btn-tactile-primary inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create your own inbox
        </Link>
      </div>
    </div>
  );
}
