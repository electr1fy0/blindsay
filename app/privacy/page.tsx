import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] text-[#eeecea]">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/blindsay.png"
            alt="BLINDSAY"
            width={22}
            height={22}
            className="rounded-sm opacity-70 grayscale"
          />
          <span className="text-[11px] font-medium tracking-[0.16em] uppercase text-[#eeecea]/60">
            Blindsay
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm text-[#85827e] transition-colors hover:text-[#ddd]"
        >
          Back
        </Link>
      </header>

      <main className="mx-auto flex-1 px-6 py-10 sm:py-16 lg:px-0">
        <article className="mx-auto max-w-lg space-y-6">
          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#777672]">
              Privacy
            </p>
            <h1 className="text-3xl font-medium tracking-[-0.04em] text-[#f1efed]">
              Your data stays yours.
            </h1>
          </div>

          <div className="space-y-5 leading-relaxed text-[#a8a5a1]">
            <p>
              We do <strong className="text-[#ddd]">not</strong> sell your
              personal data. No third-party brokers, no advertisers getting a
              peek.
            </p>

            <p>
              We store what Blindsay needs to work: your email, name, and
              profile image from your OAuth provider, your chosen username, your
              inbox preferences, and the messages people send you.
            </p>

            <p>
              Data in transit is encrypted with HTTPS/TLS. We use Vercel
              Analytics for aggregate usage
              stats; it doesn't track you across sites. Your IP address may be
              accessed ephemerally for rate limiting but is not stored.
            </p>

            <p>
              When someone sends an anonymous message, we store nothing about
              them: no IP, no device info, no metadata. We genuinely can't
              trace who sent it.
            </p>

            <p>
              We use essential cookies for authentication only. No tracking
              cookies, no ad cookies.
            </p>

            <p>
              You can soft-delete your account from the settings page; your
              username is freed and you'll be signed out. If you'd like your
              data fully removed, reach out and we'll take care of it.
            </p>

            <p>
              Questions?{" "}
              <a
                href="mailto:thisisayushpandey@gmail.com"
                className="text-[#ddd] underline underline-offset-2 transition-colors hover:text-white"
              >
                thisisayushpandey@gmail.com
              </a>
            </p>
          </div>

          <p className="pt-6 text-xs text-[#686560]">
            Last updated July 2026. We'll let you know if anything changes.
          </p>
        </article>
      </main>

      <footer className="border-t border-white/[0.06] px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2.5 text-[#eeecea]/60">
            <Image
              src="/blindsay.png"
              alt="BLINDSAY"
              width={18}
              height={18}
              className="rounded-sm opacity-70 grayscale"
            />
            <span className="text-[10px] font-medium tracking-[0.16em] uppercase">
              Blindsay
            </span>
          </div>
          <Link
            href="/"
            className="text-xs text-[#686560] transition-colors hover:text-[#a8a5a1]"
          >
            Back home
          </Link>
        </div>
      </footer>
    </div>
  );
}
