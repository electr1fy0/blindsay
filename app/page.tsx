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
import { FloatingHeroSvgs } from "@/components/ui/floating-hero-svgs";
import { WobbleCard } from "@/components/ui/wobble-card";
import { StaggerContainer, StaggerItem, ScrollReveal } from "@/components/ui/hero-reveal";
import { FloatingNav } from "@/components/ui/floating-navbar";
import {
  AnimatedLinkIcon,
  AnimatedInboxIcon,
  AnimatedFilterIcon,
  AnimatedPauseToggle,
  AnimatedReplyControlIcon,
  AnimatedHiddenWordsWidget,
  AnimatedPauseInboxWidget,
  AnimatedReplyControlWidget
} from "@/components/ui/animated-icons";
import { HowItWorksTimeline } from "@/components/ui/how-it-works-timeline";



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
      className="h-[100dvh] overflow-y-auto overflow-x-hidden w-full bg-[#080808] relative text-[#eeecea] selection:bg-[#3B82F6]/30"
      style={{ colorScheme: "dark" }}
    >
      <BackgroundRippleEffect />
      <FloatingNav
        logo={
          <Link href="/" className="flex items-center px-2 py-1">
            <Image src="/blindsay.png" alt="BLINDSAY logo" width={28} height={28} className="opacity-70 grayscale rounded-sm" />
          </Link>
        }
        navItems={[
          { name: "How it works", link: "#how-it-works" },
          { name: "FAQ", link: "#faq" },
        ]}
        cta={
          viewer?.username ? (
            <Link
              href={`/${viewer.username}`}
              className="relative rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20"
            >
              Open inbox
            </Link>
          ) : (
            <AuthButtons
              user={null}
              size="sm"
              variant="default"
              signInLabel="Start inbox"
              className="[&_button]:relative [&_button]:rounded-full [&_button]:bg-neutral-900 [&_button]:px-4 [&_button]:py-2 [&_button]:text-sm [&_button]:font-medium [&_button]:text-white [&_button]:transition-all [&_button]:hover:bg-neutral-800 [&_button]:hover:shadow-lg [&_button]:hover:shadow-neutral-900/20 [&_button]:shadow-none [&_button]:border-0 [&_button]:h-auto [&_button]:gap-0 [&_button_>_svg]:hidden"
            />
          )
        }
      />
      <div className="relative z-20">
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-7 sm:px-10 lg:px-0">

          <StaggerContainer className="pt-48 sm:pt-56 flex flex-col items-center text-center relative z-10">
            <StaggerItem yOffset={-12}>
              <Link
                href="https://github.com/electr1fy0/blindsay"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HoverBorderGradient
                  containerClassName="rounded-full mb-6"
                  as="span"
                  className="bg-[#1c1c1f] text-[#a8a5a1] flex items-center gap-2.5 px-3.5 py-1.5 text-xs"
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
            </StaggerItem>

            <StaggerItem yOffset={24} className="relative w-full max-w-2xl">
              <FloatingHeroSvgs />
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
            </StaggerItem>

            <StaggerItem yOffset={16}>
              <p className="mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-[#888681] max-w-lg font-light tracking-wide text-center">
                Anonymous messages, AMAs, and feedback.
                <br />
                Private by default, public by choice.
              </p>
            </StaggerItem>

            <StaggerItem yOffset={12} className="mt-8 flex flex-wrap justify-center items-center gap-4">
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
            </StaggerItem>
          </StaggerContainer>

          <main className="w-full">
            <ScrollReveal>
              <section className="mt-48 max-w-[46rem] sm:mt-64">
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
            </ScrollReveal>

            <section className="mt-56 sm:mt-72">
              <ScrollReveal>
                <div className="mb-10 max-w-[42rem]">
                  <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-[#777672]">
                    The exchange
                  </p>
                  <h2 className="text-3xl font-medium tracking-[-0.05em]">
                    One link. Open questions, private replies.
                  </h2>
                </div>
              </ScrollReveal>
              <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
                <ScrollReveal delay={0} className="h-full">
                  <WobbleCard
                    containerClassName="bg-indigo-900 border border-white/[0.1] rounded-[1.5rem] p-0"
                    className="h-full flex flex-col justify-between min-h-[30rem] p-8 sm:p-12"
                  >
                    <div>
                      <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-white/70">
                        Share your link
                      </p>
                      <div className="mt-8 mb-4 text-white/90">
                        <AnimatedLinkIcon />
                      </div>
                      <p className="mt-6 text-2xl font-medium tracking-[-0.045em] text-white">
                        Say what you never said.
                      </p>
                      <p className="mt-4 text-sm leading-6 text-white/80">
                        A personal link lets people leave messages, ask questions,
                        or share candid feedback anonymously.
                      </p>
                    </div>
                    <div className="mt-10 flex items-center justify-center rounded-lg border border-white/[0.09] px-4 py-3 font-mono text-xs text-white/70">
                      <span>blindsay.xyz/you</span>
                    </div>
                  </WobbleCard>
                </ScrollReveal>
                <ScrollReveal delay={0.1} className="h-full">
                  <WobbleCard
                    containerClassName="bg-purple-900 border border-white/[0.1] rounded-[1.5rem] p-0"
                    className="h-full flex flex-col justify-between min-h-[30rem] p-8 sm:p-12"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.22em] text-white/70">
                        <span>Private inbox</span>
                        <span>Anonymous</span>
                      </div>
                      <div className="mt-8 mb-4 text-white/90">
                        <AnimatedInboxIcon />
                      </div>
                      <p className="mt-6 max-w-md text-xl tracking-[-0.03em] text-white">
                        &ldquo;I still think about the kindness you showed me that
                        day.&rdquo;
                      </p>
                    </div>
                    <div>
                      <div className="my-7 h-px bg-white/[0.09]" />
                      <div className="flex gap-4">
                        <span className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-purple-400">
                          Reply
                        </span>
                        <p className="text-sm leading-6 text-[#b2afaa]">
                          I did not know you needed it. Thank you for telling me.
                          <span className="mt-2 block text-purple-200/70">
                            Replying makes this exchange public.
                          </span>
                        </p>
                      </div>
                    </div>
                  </WobbleCard>
                </ScrollReveal>
              </div>
            </section>

            <section id="how-it-works" className="mt-56 sm:mt-72">
              <ScrollReveal>
                <div className="mb-10 inline-flex rounded-full border border-white/10 px-4 py-2 font-mono text-xs text-[#96938f]">
                  How it works <span className="ml-3 text-[#3B82F6]">03</span>
                </div>
              </ScrollReveal>
              <HowItWorksTimeline />
            </section>

            <section className="mt-56 sm:mt-72">
              <ScrollReveal>
                <h2 className="mb-8 text-3xl font-medium tracking-[-0.05em]">
                  Private first. Public by choice.
                </h2>
                <p className="mb-12 max-w-[43rem] text-lg leading-8 text-[#a8a5a1]">
                  A simple boundary makes room for braver words: unopened messages
                  stay yours alone, while a reply turns one into a conversation.
                </p>
              </ScrollReveal>
              <div className="grid gap-5 md:grid-cols-2">
                <ScrollReveal delay={0}>
                  <WobbleCard
                    containerClassName="bg-stone-900 border border-white/[0.1] rounded-[1.5rem] p-0"
                    className="flex flex-col justify-between min-h-[22rem] p-8 sm:p-12"
                  >
                    <div className="flex items-center justify-between font-mono text-xs text-white/70">
                      <span>INBOX / PRIVATE</span>
                      <span className="rounded-full bg-white/[0.05] px-3 py-1">
                        Unread
                      </span>
                    </div>
                    <blockquote className="mt-12 text-2xl tracking-[-0.025em] text-white leading-normal">
                      &ldquo;I never told you how much that helped.&rdquo;
                    </blockquote>
                    <p className="mt-4 text-sm text-white/85">
                      Visible only to you until you respond.
                    </p>
                  </WobbleCard>
                </ScrollReveal>
                <ScrollReveal delay={0.1}>
                  <WobbleCard
                    containerClassName="bg-teal-950 border border-white/[0.1] rounded-[1.5rem] p-0"
                    className="flex flex-col justify-between min-h-[22rem] p-8 sm:p-12"
                  >
                    <div className="flex items-center justify-between font-mono text-xs text-white/70">
                      <span>REPLY / PUBLISHED</span>
                      <span className="rounded-full bg-[#3B82F6]/15 px-3 py-1 text-blue-400">
                        Live
                      </span>
                    </div>
                    <blockquote className="mt-12 text-2xl tracking-[-0.025em] text-white leading-normal">
                      &ldquo;You were worth showing up for.&rdquo;
                    </blockquote>
                    <p className="mt-4 text-sm text-white/85">
                      Your reply makes the exchange visible.
                    </p>
                  </WobbleCard>
                </ScrollReveal>
              </div>
            </section>

            <section className="mt-56 sm:mt-72">
              <ScrollReveal>
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
              </ScrollReveal>
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  {
                    title: "Hidden words",
                    detail:
                      "Filter names and phrases before they reach your inbox.",
                    meta: "14 filters",
                    color: "bg-rose-950",
                    illustration: <AnimatedFilterIcon />,
                  },
                  {
                    title: "Pause inbox",
                    detail:
                      "Stop incoming messages without taking down your link.",
                    meta: "Available",
                    color: "bg-amber-950",
                    illustration: <AnimatedPauseToggle />,
                  },
                  {
                    title: "Reply control",
                    detail:
                      "Only replies publish. Everything else remains private.",
                    meta: "Private first",
                    color: "bg-blue-950",
                    illustration: <AnimatedReplyControlIcon />,
                  },
                ].map((control, idx) => (
                  <ScrollReveal key={control.title} delay={idx * 0.1}>
                    <WobbleCard
                      containerClassName={`${control.color} border border-white/[0.1] rounded-[1.5rem] p-0`}
                      className="flex min-h-72 flex-col justify-between p-8"
                    >
                      <div className="flex items-center justify-between">
                        {control.illustration}
                        <span className="rounded-full border border-white/[0.09] px-3 py-1 font-mono text-[0.68rem] text-white/70 whitespace-nowrap">
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
                  </ScrollReveal>
                ))}
              </div>
            </section>

            <section id="faq" className="mt-56 max-w-[48rem] sm:mt-72">
              <ScrollReveal>
                <div className="mb-9 inline-flex rounded-full border border-white/10 px-4 py-2 font-mono text-xs text-[#96938f]">
                  Questions
                </div>
                <LandingFaq questions={questions} />
              </ScrollReveal>
            </section>

            <section className="mb-0 mt-48 sm:mt-64">
              <ScrollReveal yOffset={16}>
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
              </ScrollReveal>
            </section>
          </main>

            <footer className="mt-48 border-t border-white/[0.08] pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[#eeecea] opacity-80 select-none">
              <Image
                src="/blindsay.png"
                alt="BLINDSAY"
                width={24}
                height={24}
                className="opacity-70 grayscale rounded-md"
              />
              <span className="text-[13px] font-medium tracking-[0.16em] uppercase">
                BLINDSAY
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-sm text-[#85827e] transition-colors hover:text-[#ddd] font-mono text-[13px] tracking-wide"
              >
                privacy
              </Link>
              <Link
                href="https://github.com/electr1fy0/blindsay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#85827e] transition-colors hover:text-[#ddd] font-mono text-[13px] tracking-wide"
              >
                github
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
