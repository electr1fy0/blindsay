import Link from "next/link";
import Image from "next/image";
import { AuthButtons } from "@/components/auth-buttons";
import { LandingFaq } from "@/components/landing-faq";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const steps = [
  {
    count: "01",
    title: "Claim a private address",
    body: "Choose your name and share one quiet link wherever people find you.",
  },
  {
    count: "02",
    title: "Receive what went unsaid",
    body: "Notes arrive anonymously in an inbox only you can read.",
  },
  {
    count: "03",
    title: "Answer on your terms",
    body: "Reply to bring a conversation into public view. Leave the rest private.",
  },
] as const;

const questions = [
  {
    title: "Can anyone see messages sent to me?",
    answer: "No. A message stays private unless you choose to reply to it.",
  },
  {
    title: "Can I pause new messages?",
    answer: "Yes. Pause your link or close the inbox whenever you need quiet.",
  },
  {
    title: "What protects me from abusive notes?",
    answer:
      "Hidden-word controls let you filter phrases before they reach you.",
  },
] as const;

export default async function Page() {
  const session = await getServerSession(authOptions);
  const viewer = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { username: true, name: true },
      })
    : null;

  return (
    <div className="h-screen overflow-y-auto w-full bg-black relative text-[#eeecea] selection:bg-primary/30">
      <div className="relative z-20">
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-7 sm:px-10 lg:px-0">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/blindsay.png"
                alt="BLINDSAY"
                width={40}
                height={40}
                className="opacity-70 grayscale"
              />
              <span className="sr-only">BLINDSAY</span>
            </Link>
            <div className="flex items-center gap-2">
              {!session ? (
                <>
                  <AuthButtons
                    user={null}
                    size="default"
                    variant="ghost"
                    signInLabel="Log in"
                    className="[&_button]:rounded-full [&_button]:border [&_button]:border-white/10 [&_button]:px-5 [&_button]:h-10 [&_button]:text-[#ddd] [&_button]:hover:bg-white/[0.06] [&_button]:hover:text-white [&_svg]:hidden"
                  />
                  <AuthButtons
                    user={null}
                    size="default"
                    variant="default"
                    signInLabel="Start inbox"
                    className="[&_button]:rounded-full [&_button]:px-5 [&_button]:h-10 [&_svg]:hidden"
                  />
                </>
              ) : (
                <Link
                  href={
                    viewer?.username ? `/${viewer.username}` : "/onboarding"
                  }
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                    "rounded-full px-5 h-10",
                  )}
                >
                  {viewer?.username ? "Open inbox" : "Claim username"}
                </Link>
              )}
            </div>
          </nav>

          <header className="landing-reveal pt-24 sm:pt-32">
            <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-medium leading-[1.08] tracking-[-0.05em] text-[#f1efed]">
              Words you never
              <span className="block mt-1">found the courage</span>
              <span className="block text-[#d8d4d0] mt-1">
                to{" "}
                <span className="italic font-normal text-primary">
                  say aloud.
                </span>
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-[#888681] max-w-lg font-light tracking-wide">
              Receive honest notes anonymously. Publish only the conversations
              you choose.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {viewer?.username ? (
                <Link
                  href={`/${viewer.username}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "h-13 rounded-full px-9 text-base font-medium bg-primary text-white hover:bg-primary/90 transition-colors duration-200 cursor-pointer",
                  )}
                >
                  Open your inbox
                </Link>
              ) : (
                <AuthButtons
                  user={null}
                  size="lg"
                  variant="default"
                  signInLabel="Start your inbox"
                  className="[&_button]:h-13 [&_button]:rounded-full [&_button]:px-9 [&_button]:text-base [&_button]:font-medium [&_button]:bg-primary [&_button]:text-white [&_button]:hover:bg-primary/90 [&_button]:transition-colors [&_button]:duration-200 [&_button]:cursor-pointer [&_svg]:hidden"
                />
              )}
            </div>
          </header>

          <main className="landing-reveal-late">
            <section className="mt-36 max-w-[46rem] sm:mt-48">
              <h2 className="mb-8 text-2xl font-medium tracking-[-0.035em]">
                A softer place for honesty.
              </h2>
              <div className="space-y-7 text-lg leading-[1.75] text-[#bbb8b4] sm:text-xl">
                <p>
                  Some thoughts need distance before they can become honest.
                  Blindsay gives friends, readers, and strangers a private way
                  to leave the words they held back.
                </p>
                <p>
                  Your inbox belongs to you.{" "}
                  <span className="font-medium text-[#ebe7e2]">
                    Nothing becomes public
                  </span>{" "}
                  until you answer it.
                </p>
              </div>
            </section>

            <section className="mt-28 sm:mt-36">
              <div className="mb-10 max-w-[42rem]">
                <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-[#777672]">
                  The exchange
                </p>
                <h2 className="text-3xl font-medium tracking-[-0.05em]">
                  One link. One honest conversation.
                </h2>
              </div>
              <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
                <div className="rounded-[1.25rem] border border-white/[0.1] p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#777672]">
                      Share your prompt
                    </p>
                    <div className="mt-6 text-[#96938f]/60">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-primary/70"
                      >
                        <rect
                          x="4"
                          y="12"
                          width="40"
                          height="28"
                          rx="8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <path
                          d="M20 26l8-8M22 18h6v6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="20" r="2" fill="currentColor" />
                        <circle cx="36" cy="32" r="2" fill="currentColor" />
                      </svg>
                    </div>
                    <p className="mt-6 text-2xl font-medium tracking-[-0.045em] text-[#ece9e5]">
                      Say what you never said.
                    </p>
                    <p className="mt-4 text-sm leading-6 text-[#8d8a86]">
                      A personal link lets someone write without attaching their
                      name.
                    </p>
                  </div>
                  <div className="mt-10 flex items-center justify-between rounded-lg border border-white/[0.09] px-4 py-3 font-mono text-xs text-[#96938f]">
                    <span>blindsay.app/you</span>
                    <span className="text-primary">Copy</span>
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-white/[0.1] p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#777672]">
                      <span>Private inbox</span>
                      <span>Anonymous</span>
                    </div>
                    <div className="mt-6 text-[#96938f]/60">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-primary/70"
                      >
                        <rect
                          x="6"
                          y="10"
                          width="36"
                          height="24"
                          rx="6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                        />
                        <path
                          d="M6 14l18 11.5L42 14"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <rect
                          x="28"
                          y="24"
                          width="12"
                          height="9"
                          rx="2"
                          fill="#EF4444"
                          className="stroke-white/10"
                          strokeWidth="1"
                        />
                        <path
                          d="M31 24v-2.5a3 3 0 016 0v2.5"
                          stroke="#EF4444"
                          strokeWidth="1"
                          fill="none"
                        />
                      </svg>
                    </div>
                    <p className="mt-6 max-w-md text-xl tracking-[-0.03em] text-[#e5e2de]">
                      &ldquo;I still think about the kindness you showed me that
                      day.&rdquo;
                    </p>
                  </div>
                  <div>
                    <div className="my-7 h-px bg-white/[0.09]" />
                    <div className="flex gap-4">
                      <span className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">
                        Reply
                      </span>
                      <p className="text-sm leading-6 text-[#b2afaa]">
                        I did not know you needed it. Thank you for telling me.
                        <span className="mt-2 block text-[#706d69]">
                          Replying makes this exchange public.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-32 sm:mt-40">
              <div className="mb-10 inline-flex rounded-full border border-white/10 px-4 py-2 font-mono text-xs text-[#96938f]">
                How it works <span className="ml-3 text-primary">03</span>
              </div>
              <div className="border-t border-white/[0.09]">
                {steps.map((step) => (
                  <div
                    key={step.count}
                    className="grid gap-4 border-b border-dashed border-white/[0.11] py-8 sm:grid-cols-[4.5rem_18rem_1fr] sm:items-start"
                  >
                    <span className="font-mono text-xs text-primary">
                      {step.count}
                    </span>
                    <div className="flex items-center gap-3">
                      {step.count === "01" && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary shrink-0"
                        >
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      )}
                      {step.count === "02" && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary shrink-0"
                        >
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      )}
                      {step.count === "03" && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary shrink-0"
                        >
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                      )}
                      <h3 className="text-lg font-medium tracking-[-0.025em]">
                        {step.title}
                      </h3>
                    </div>
                    <p className="max-w-md text-base leading-7 text-[#96938f]">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-32 sm:mt-40">
              <h2 className="mb-8 text-3xl font-medium tracking-[-0.05em]">
                Private first. Public by choice.
              </h2>
              <p className="mb-12 max-w-[43rem] text-lg leading-8 text-[#a8a5a1]">
                A simple boundary makes room for braver words: unopened messages
                stay yours alone, while a reply turns one into a conversation.
              </p>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/[0.1] p-6 sm:p-8">
                  <div className="mb-16 flex items-center justify-between font-mono text-xs text-[#777672]">
                    <span>INBOX / PRIVATE</span>
                    <span className="rounded-full bg-white/[0.05] px-3 py-1">
                      Unread
                    </span>
                  </div>
                  <blockquote className="text-xl tracking-[-0.025em] text-[#e4e1dd]">
                    &ldquo;I never told you how much that helped.&rdquo;
                  </blockquote>
                  <p className="mt-4 text-sm text-[#7f7d78]">
                    Visible only to you until you respond.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-white/[0.1] p-6 sm:p-8">
                  <div className="mb-16 flex items-center justify-between font-mono text-xs text-[#777672]">
                    <span>REPLY / PUBLISHED</span>
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-primary">
                      Live
                    </span>
                  </div>
                  <blockquote className="text-xl tracking-[-0.025em] text-[#e4e1dd]">
                    &ldquo;You were worth showing up for.&rdquo;
                  </blockquote>
                  <p className="mt-4 text-sm text-[#7f7d78]">
                    Your reply makes the exchange visible.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-28 sm:mt-36">
              <div className="mb-10 space-y-4">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#777672]">
                  Built-in controls
                </p>
                <h2 className="text-3xl font-medium tracking-[-0.05em] text-[#f1efed]">
                  Keep the door open, safely.
                </h2>
                <p className="text-base leading-7 text-[#85827e] max-w-lg">
                  Lightweight boundaries are always within reach when the
                  conversation needs them.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  {
                    title: "Hidden words",
                    detail:
                      "Filter names and phrases before they reach your inbox.",
                    meta: "14 filters",
                    illustration: (
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-primary/70"
                      >
                        <rect
                          x="4"
                          y="8"
                          width="32"
                          height="24"
                          rx="6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <path
                          d="M12 20h10M14 26h6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="28"
                          cy="20"
                          r="3"
                          fill="#EF4444"
                          className="animate-pulse"
                        />
                      </svg>
                    ),
                  },
                  {
                    title: "Pause inbox",
                    detail:
                      "Stop incoming messages without taking down your link.",
                    meta: "Available",
                    illustration: (
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-primary/70"
                      >
                        <rect
                          x="6"
                          y="12"
                          width="28"
                          height="16"
                          rx="8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <circle cx="14" cy="20" r="5" fill="currentColor" />
                        <path
                          d="M13 18v4M15 18v4"
                          stroke="#101010"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    title: "Reply control",
                    detail:
                      "Only replies publish. Everything else remains private.",
                    meta: "Private first",
                    illustration: (
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-primary/70"
                      >
                        <path
                          d="M8 20h24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeDasharray="3 3"
                        />
                        <circle cx="10" cy="20" r="4" fill="currentColor" />
                        <path
                          d="M26 20s3-4 6-4 6 4 6 4-3 4-6 4-6-4-6-4z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <circle cx="32" cy="20" r="1.5" fill="currentColor" />
                      </svg>
                    ),
                  },
                ].map((control) => (
                  <div
                    key={control.title}
                    className="flex min-h-56 flex-col justify-between rounded-[1.15rem] border border-white/[0.1] p-6"
                  >
                    <div className="flex items-start justify-between">
                      {control.illustration}
                      <span className="rounded-full border border-white/[0.09] px-3 py-1 font-mono text-[0.68rem] text-[#87847f]">
                        {control.meta}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium tracking-[-0.03em]">
                        {control.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[#8d8a86]">
                        {control.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-32 max-w-[48rem] sm:mt-40">
              <div className="mb-9 inline-flex rounded-full border border-white/10 px-4 py-2 font-mono text-xs text-[#96938f]">
                Questions <span className="ml-3 text-primary">03</span>
              </div>
              <LandingFaq questions={questions} />
            </section>

            <section className="mb-16 mt-32 border-t border-white/[0.09] pt-14 sm:mt-44">
              <h2 className="max-w-xl text-4xl font-medium tracking-[-0.055em] sm:text-5xl">
                Give honesty somewhere gentle to land.
              </h2>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                {viewer?.username ? (
                  <Link
                    href={`/${viewer.username}`}
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" }),
                      "h-14 rounded-full px-9 text-base",
                    )}
                  >
                    Open your inbox
                  </Link>
                ) : (
                  <AuthButtons
                    user={null}
                    size="lg"
                    variant="default"
                    signInLabel="Begin quietly"
                    className="[&_button]:h-14 [&_button]:rounded-full [&_button]:px-9 [&_button]:text-base [&_svg]:hidden"
                  />
                )}
                <Link
                  href="https://github.com/electr1fy0/blindsay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#85827e] transition-colors hover:text-[#ddd]"
                >
                  View the source on GitHub
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
