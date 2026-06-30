import Link from "next/link";
import Image from "next/image";
import { AuthButtons } from "@/components/auth-buttons";
import { LandingFaq } from "@/components/landing-faq";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { CanvasText } from "@/components/ui/canvas-text";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { WobbleCard } from "@/components/ui/wobble-card";

const steps = [
  {
    count: "01",
    title: "Claim a private address",
    body: "Choose your name and share one quiet link wherever people find you.",
  },
  {
    count: "02",
    title: "Receive what went unsaid",
    body: "Anonymous messages, candid feedback, and AMA questions arrive in an inbox only you can read.",
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
    title: "What protects me from abusive messages?",
    answer:
      "Hidden-word controls let you filter phrases before they reach you.",
  },
  {
    title: "Is Blindsay really anonymous? Can you trace senders?",
    answer:
      "Yes, it is completely anonymous. We do not track IP addresses, exact locations, or browser details of senders, ensuring their thoughts and feedback remain secure.",
  },
  {
    title: "What is Blindsay best used for?",
    answer:
      "It is perfect for hosting open audience AMAs, gathering candid constructive feedback from colleagues or readers, and giving people a safe space to share what they normally hold back.",
  },
  {
    title: "Is the platform free to use?",
    answer:
      "Yes. You can claim your personal quiet link, receive messages, gather feedback, and run AMAs entirely free of charge.",
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

  let starsCount = 0;
  try {
    const res = await fetch(
      "https://api.github.com/repos/electr1fy0/blindsay",
      {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "blindsay-app",
        },
      },
    );
    if (res.ok) {
      const data = await res.json();
      starsCount = data.stargazers_count || 0;
    }
  } catch (e) {
    console.error("Failed to fetch GitHub stars:", e);
  }

  return (
    <div 
      className="h-[100dvh] overflow-y-auto w-full bg-[#080808] relative text-[#eeecea] selection:bg-[#3B82F6]/30"
      style={{ colorScheme: "dark" }}
    >
      <BackgroundRippleEffect />
      <div className="relative z-20">
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-7 sm:px-10 lg:px-0">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/blindsay.png"
                alt="BLINDSAY logo"
                width={36}
                height={36}
                className="opacity-70 grayscale rounded-md"
              />
              <span className="text-[12px] font-medium tracking-[0.12em] uppercase text-[#eeecea] opacity-80 select-none">
                BLINDSAY
              </span>
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
                  <div className="[&_button]:rounded-full [&_button]:px-5 [&_button]:h-10 [&_button]:bg-[#2563EB] [&_button]:text-white [&_button]:hover:bg-[#2563EB]/90 [&_button]:outline-none [&_button]:focus-visible:ring-[3px] [&_button]:focus-visible:ring-ring/30 [&_svg]:hidden">
                    <AuthButtons
                      user={null}
                      size="default"
                      variant="default"
                      signInLabel="Start inbox"
                      className="gap-2 group"
                    />
                  </div>
                </>
              ) : (
                <Link
                  href={
                    viewer?.username ? `/${viewer.username}` : "/onboarding"
                  }
                  className="inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full px-5 h-10 text-sm font-medium bg-[#2563EB] text-white hover:bg-[#2563EB]/90 border border-[#2563EB] border-t-white/20 transition-all duration-200 cursor-pointer"
                >
                  {viewer?.username ? "Open inbox" : "Claim username"}
                </Link>
              )}
            </div>
          </nav>

          <header className="landing-reveal pt-24 sm:pt-32 flex flex-col items-center text-center relative z-10">
            <Link
              href="https://github.com/electr1fy0/blindsay"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HoverBorderGradient
                containerClassName="rounded-full mb-6"
                as="span"
                className="bg-[#1c1c1f] text-[#a8a5a1] dark:bg-[#1c1c1f] dark:text-[#a8a5a1] flex items-center gap-2.5 px-3.5 py-1.5 text-xs"
                duration={2}
              >
                <svg
                  height="14"
                  width="14"
                  viewBox="0 0 16 16"
                  className="fill-current"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                <span className="font-medium tracking-wide">GitHub</span>
                {starsCount > 0 && (
                  <>
                    <span className="text-white/20">|</span>
                    <span className="font-mono text-[12px] flex items-center gap-1.5">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="shrink-0"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      {starsCount}
                    </span>
                  </>
                )}
              </HoverBorderGradient>
            </Link>

            <div className="relative w-full max-w-2xl">
              {/* Floating context-relevant SVG 1: Minimalist paper airplane (Sky Blue to Emerald) */}
              <div
                className="absolute -top-12 left-4 sm:-left-12 pointer-events-none select-none animate-bounce"
                style={{ animationDuration: "6s" }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#airplane-grad)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_2px_8px_rgba(0,185,255,0.25)]"
                >
                  <defs>
                    <linearGradient
                      id="airplane-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#00f5a0" />
                    </linearGradient>
                  </defs>
                  <path d="M22 2L2 9l8.71 3.79L22 2z" />
                  <path d="M10.71 12.79L14 22l8-20-8 20z" />
                </svg>
              </div>

              {/* Floating context-relevant SVG 2: Minimalist open envelope (Amber to Orange) */}
              <div
                className="absolute -top-10 right-4 sm:-right-8 pointer-events-none select-none animate-bounce"
                style={{ animationDuration: "7s", animationDelay: "0.5s" }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#envelope-grad)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_2px_8px_rgba(255,90,0,0.25)]"
                >
                  <defs>
                    <linearGradient
                      id="envelope-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ffb000" />
                      <stop offset="100%" stopColor="#ff5a00" />
                    </linearGradient>
                  </defs>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>

              {/* Floating context-relevant SVG 3: Minimalist speech bubble with dots (Pink to Purple) */}
              <div
                className="absolute -bottom-10 right-4 sm:-right-12 pointer-events-none select-none animate-bounce"
                style={{ animationDuration: "8s", animationDelay: "1s" }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#bubble-grad)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_2px_8px_rgba(127,0,255,0.25)]"
                >
                  <defs>
                    <linearGradient
                      id="bubble-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ff007f" />
                      <stop offset="100%" stopColor="#7f00ff" />
                    </linearGradient>
                  </defs>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <circle cx="8" cy="10" r="1" fill="url(#bubble-grad)" />
                  <circle cx="12" cy="10" r="1" fill="url(#bubble-grad)" />
                  <circle cx="16" cy="10" r="1" fill="url(#bubble-grad)" />
                </svg>
              </div>

              {/* Floating context-relevant SVG 4: Minimalist feedback heart (Crimson to Rose) */}
              <div
                className="absolute -bottom-8 left-4 sm:-left-8 pointer-events-none select-none animate-bounce"
                style={{ animationDuration: "9s", animationDelay: "1.5s" }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#heart-grad)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_2px_8px_rgba(255,0,85,0.25)]"
                >
                  <defs>
                    <linearGradient
                      id="heart-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ff0055" />
                      <stop offset="100%" stopColor="#ff5e97" />
                    </linearGradient>
                  </defs>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-medium leading-[1.08] tracking-[-0.05em] text-[#f1efed]">
                Receive the unsaid words{" "}
                <CanvasText
                  text="anonymously"
                  backgroundClassName="bg-blue-600 dark:bg-blue-700"
                  colors={[
                    "rgba(0, 153, 255, 1)",
                    "rgba(0, 153, 255, 0.9)",
                    "rgba(0, 153, 255, 0.8)",
                    "rgba(0, 153, 255, 0.7)",
                    "rgba(0, 153, 255, 0.6)",
                    "rgba(0, 153, 255, 0.5)",
                    "rgba(0, 153, 255, 0.4)",
                    "rgba(0, 153, 255, 0.3)",
                    "rgba(0, 153, 255, 0.2)",
                    "rgba(0, 153, 255, 0.1)",
                  ]}
                  lineGap={4}
                  animationDuration={20}
                  className="align-middle"
                />
              </h1>
            </div>
            <p className="mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-[#888681] max-w-lg font-light tracking-wide text-center">
              Anonymous messages, AMAs, and feedback.
              <br />
              Private by default, public by choice.
            </p>
            <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
              {viewer?.username ? (
                <Link
                  href={`/${viewer.username}`}
                  className="group inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap h-13 rounded-full px-9 text-base font-medium bg-[#2563EB] text-white hover:bg-[#2563EB]/90 border border-[#2563EB] border-t-white/20 transition-all duration-200 cursor-pointer"
                >
                  <span className="underline-offset-4 group-hover:underline group-hover:decoration-wavy group-hover:decoration-white/40">
                    Open your inbox
                  </span>
                </Link>
              ) : (
                <div className="[&_button]:inline-flex [&_button]:shrink-0 [&_button]:select-none [&_button]:items-center [&_button]:justify-center [&_button]:whitespace-nowrap [&_button]:h-13 [&_button]:rounded-full [&_button]:px-9 [&_button]:text-base [&_button]:font-medium [&_button]:bg-[#2563EB] [&_button]:text-white [&_button]:hover:bg-[#2563EB]/90 [&_button]:transition-all [&_button]:duration-200 [&_button]:cursor-pointer [&_button]:shadow-none [&_button]:hover:shadow-none [&_button]:focus:ring-0 [&_button]:outline-none [&_button_>_svg]:hidden">
                  <AuthButtons
                    user={null}
                    size="lg"
                    variant="default"
                    signInLabel={
                      <span className="underline-offset-4 group-hover:underline group-hover:decoration-wavy group-hover:decoration-white/40">
                        Start your inbox
                      </span>
                    }
                    className="gap-2 group"
                  />
                </div>
              )}
            </div>
          </header>

          <main className="landing-reveal-late">
            <section className="mt-36 max-w-[46rem] sm:mt-48">
              <h2 className="mb-8 text-2xl font-medium tracking-[-0.035em]">
                A softer place for conversations, feedback, and open AMAs.
              </h2>
              <div className="space-y-7 text-lg leading-[1.75] text-[#bbb8b4] sm:text-xl">
                <p>
                  Some thoughts need distance before they can be shared.
                  Blindsay gives friends, readers, and strangers a private way
                  to leave anonymous messages, share constructive feedback, or
                  start spontaneous AMAs.
                </p>
                <p>
                  Your inbox belongs to you.{" "}
                  <span className="font-medium text-[#ebe7e2]">
                    Nothing becomes public
                  </span>{" "}
                  until you choose to answer it.
                </p>
              </div>
            </section>

            <section className="mt-28 sm:mt-36">
              <div className="mb-10 max-w-[42rem]">
                <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-[#777672]">
                  The exchange
                </p>
                <h2 className="text-3xl font-medium tracking-[-0.05em]">
                  One link. Open questions, private replies.
                </h2>
              </div>
              <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
                <WobbleCard
                  containerClassName="bg-indigo-950 border border-white/[0.1] rounded-[1.25rem] p-0"
                  className="h-full flex flex-col justify-between p-6 sm:p-8"
                >
                  <div>
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-white/70">
                      Share your link
                    </p>
                    <div className="mt-6 text-white/80">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#3B82F6]/70"
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
                    <p className="mt-6 text-2xl font-medium tracking-[-0.045em] text-white">
                      Say what you never said.
                    </p>
                    <p className="mt-4 text-sm leading-6 text-white/80">
                      A personal link lets people leave messages, ask questions,
                      or share candid feedback anonymously.
                    </p>
                  </div>
                  <div className="mt-10 flex items-center justify-between rounded-lg border border-white/[0.09] px-4 py-3 font-mono text-xs text-white/70">
                    <span>blindsay.app/you</span>
                    <span className="text-[#3B82F6]">Copy</span>
                  </div>
                </WobbleCard>
                <WobbleCard
                  containerClassName="bg-purple-950 border border-white/[0.1] rounded-[1.25rem] p-0"
                  className="h-full flex flex-col justify-between p-6 sm:p-8"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.22em] text-white/70">
                      <span>Private inbox</span>
                      <span>Anonymous</span>
                    </div>
                    <div className="mt-6 text-white/80">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#3B82F6]/70"
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
                    <p className="mt-6 max-w-md text-xl tracking-[-0.03em] text-white">
                      &ldquo;I still think about the kindness you showed me that
                      day.&rdquo;
                    </p>
                  </div>
                  <div>
                    <div className="my-7 h-px bg-white/[0.09]" />
                    <div className="flex gap-4">
                      <span className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#3B82F6]">
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
                </WobbleCard>
              </div>
            </section>

            <section className="mt-32 sm:mt-40">
              <div className="mb-10 inline-flex rounded-full border border-white/10 px-4 py-2 font-mono text-xs text-[#96938f]">
                How it works <span className="ml-3 text-[#3B82F6]">03</span>
              </div>
              <div className="border-t border-white/[0.09]">
                {steps.map((step) => (
                  <div
                    key={step.count}
                    className="grid gap-4 border-b border-dashed border-white/[0.11] py-8 sm:grid-cols-[4.5rem_18rem_1fr] sm:items-start"
                  >
                    <span className="font-mono text-xs text-[#3B82F6]">
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
                          className="text-[#3B82F6] shrink-0"
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
                          className="text-[#3B82F6] shrink-0"
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
                          className="text-[#3B82F6] shrink-0"
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
                <WobbleCard
                  containerClassName="bg-stone-900 border border-white/[0.1] rounded-[1.25rem] p-0"
                  className="p-6 sm:p-8 sm:px-10"
                >
                  <div className="mb-16 flex items-center justify-between font-mono text-xs text-white/70">
                    <span>INBOX / PRIVATE</span>
                    <span className="rounded-full bg-white/[0.05] px-3 py-1">
                      Unread
                    </span>
                  </div>
                  <blockquote className="text-xl tracking-[-0.025em] text-white">
                    &ldquo;I never told you how much that helped.&rdquo;
                  </blockquote>
                  <p className="mt-4 text-sm text-white/80">
                    Visible only to you until you respond.
                  </p>
                </WobbleCard>
                <WobbleCard
                  containerClassName="bg-teal-950 border border-white/[0.1] rounded-[1.25rem] p-0"
                  className="p-6 sm:p-8 sm:px-10"
                >
                  <div className="mb-16 flex items-center justify-between font-mono text-xs text-white/70">
                    <span>REPLY / PUBLISHED</span>
                    <span className="rounded-full bg-[#3B82F6]/15 px-3 py-1 text-[#3B82F6]">
                      Live
                    </span>
                  </div>
                  <blockquote className="text-xl tracking-[-0.025em] text-white">
                    &ldquo;You were worth showing up for.&rdquo;
                  </blockquote>
                  <p className="mt-4 text-sm text-white/80">
                    Your reply makes the exchange visible.
                  </p>
                </WobbleCard>
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
                    color: "bg-rose-950",
                    illustration: (
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#3B82F6]/70"
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
                    color: "bg-amber-950",
                    illustration: (
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#3B82F6]/70"
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
                    color: "bg-blue-950",
                    illustration: (
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#3B82F6]/70"
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
                  <WobbleCard
                    key={control.title}
                    containerClassName={`${control.color} border border-white/[0.1] rounded-[1.15rem] p-0`}
                    className="flex min-h-56 flex-col justify-between p-6"
                  >
                    <div className="flex items-center justify-between">
                      {control.illustration}
                      <span className="rounded-full border border-white/[0.09] px-3 py-1 font-mono text-[0.68rem] text-white/70">
                        {control.meta}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium tracking-[-0.03em] text-white">
                        {control.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-white/80">
                        {control.detail}
                      </p>
                    </div>
                  </WobbleCard>
                ))}
              </div>
            </section>

            <section className="mt-32 max-w-[48rem] sm:mt-40">
              <div className="mb-9 inline-flex rounded-full border border-white/10 px-4 py-2 font-mono text-xs text-[#96938f]">
                Questions
              </div>
              <LandingFaq questions={questions} />
            </section>

            <section className="mb-0 mt-12 sm:mt-16">
              <div className="relative flex min-h-[14rem] items-end justify-end overflow-hidden rounded-[1.25rem] border border-white/[0.1] px-6 py-6 shadow shadow-black/10 ring-1 ring-white/5 sm:min-h-[16rem] sm:px-8 sm:py-8 dark:shadow-white/10 dark:ring-white/5">
                <div className="relative z-20 flex w-full flex-col items-start gap-14">
                  <h2 className="max-w-lg text-3xl font-medium tracking-[-0.055em] text-[#f1efed] sm:text-4xl">
                    Give unsaid words somewhere gentle to land.
                  </h2>
                  <div className="flex flex-wrap items-center gap-4">
                    {viewer?.username ? (
                      <Link
                        href={`/${viewer.username}`}
                        className="group inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap h-13 rounded-full px-8 text-base font-medium bg-[#2563EB] text-white hover:bg-[#2563EB]/90 border border-[#2563EB] border-t-white/20 transition-all duration-200 cursor-pointer"
                      >
                        <span className="underline-offset-4 group-hover:underline group-hover:decoration-wavy group-hover:decoration-white/40">
                          Open your inbox
                        </span>
                      </Link>
                    ) : (
                      <div className="[&_button]:inline-flex [&_button]:shrink-0 [&_button]:select-none [&_button]:items-center [&_button]:justify-center [&_button]:whitespace-nowrap [&_button]:h-13 [&_button]:rounded-full [&_button]:px-8 [&_button]:text-base [&_button]:font-medium [&_button]:bg-[#2563EB] [&_button]:text-white [&_button]:hover:bg-[#2563EB]/90 [&_button]:transition-all [&_button]:duration-200 [&_button]:cursor-pointer [&_button]:shadow-none [&_button]:hover:shadow-none [&_button]:focus:ring-0 [&_button]:outline-none [&_button_>_svg]:hidden">
                        <AuthButtons
                          user={null}
                          size="lg"
                          variant="default"
                          signInLabel={
                            <span className="underline-offset-4 group-hover:underline group-hover:decoration-wavy group-hover:decoration-white/40">
                              Begin quietly
                            </span>
                          }
                          className="gap-2 group"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <DottedGlowBackground
                  className="pointer-events-none mask-radial-to-90% mask-radial-at-center"
                  opacity={1}
                  gap={10}
                  radius={1.6}
                  colorLightVar="--color-neutral-500"
                  glowColorLightVar="--color-neutral-600"
                  colorDarkVar="--color-neutral-500"
                  glowColorDarkVar="--color-sky-800"
                  backgroundOpacity={0}
                  speedMin={0.3}
                  speedMax={1.6}
                  speedScale={1}
                />
              </div>
            </section>
          </main>

          <footer className="mt-16 border-t border-white/[0.08] pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-[#eeecea] opacity-80 select-none">
              <Image
                src="/blindsay.png"
                alt="BLINDSAY"
                width={20}
                height={20}
                className="opacity-70 grayscale rounded-md"
              />
              <span className="text-[11px] font-medium tracking-[0.16em] uppercase">
                BLINDSAY
              </span>
            </div>
            <Link
              href="https://github.com/electr1fy0/blindsay"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#85827e] transition-colors hover:text-[#ddd] font-mono text-[13px] tracking-wide"
            >
              github/blindsay
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
