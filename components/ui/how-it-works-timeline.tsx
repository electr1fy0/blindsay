"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  AnimatedStepLinkIcon,
  AnimatedStepInboxIcon,
  AnimatedStepBubbleIcon
} from "./animated-icons";

interface Step {
  count: string;
  title: string;
  body: string;
}

const steps: Step[] = [
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
];

// Extracted mock content previews
function MockPreviewContent({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="w-full max-w-sm space-y-4">
        {/* Share Card mockup */}
        <div className="bg-[#1c1c1f] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#85827e] text-center select-none">
            Share your link
          </div>
          <div className="bg-black/35 border border-white/5 rounded-lg px-4 py-3 text-sm text-white/90 font-mono text-center select-all">
            blindsay.xyz/you
          </div>
          <button
            className="bg-[#00b9ff] text-white text-xs font-semibold px-4.5 py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md select-none border border-white/5 hover:bg-[#00b9ff]/90 transition-colors w-full"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Copy link
          </button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="w-full max-w-sm space-y-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#85827e] pl-1 select-none">
          Your Inbox
        </div>
        <div className="space-y-4">
          {/* Older message card (translucent) */}
          <div className="flex flex-col gap-1.5 opacity-30 select-none border-b border-white/[0.04] pb-4">
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-t-[1.15rem] rounded-r-[1.15rem] rounded-bl-[0.25rem] px-4.5 py-3 max-w-[85%]">
              <p className="text-[13px] leading-relaxed text-white/95">
                That advice you gave me saved my career choice.
              </p>
            </div>
            <span className="text-[0.55rem] font-semibold tracking-[0.16em] uppercase text-white/40 pl-2">
              2 hours ago
            </span>
          </div>

          {/* Newly incoming message bubble matching actual design */}
          <motion.div
            initial={{ y: 15, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="flex flex-col gap-1.5"
          >
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-t-[1.15rem] rounded-r-[1.15rem] rounded-bl-[0.25rem] px-4.5 py-3 max-w-[85%] shadow-xl relative overflow-hidden">
              <div className="absolute right-3.5 top-3.5 w-1.5 h-1.5 rounded-full bg-[#00b9ff] animate-pulse" />
              <p className="text-[13px] leading-relaxed text-white">
                &ldquo;I wanted to tell you how proud I am of the progress you are making.&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-2 pl-2">
              <span className="text-[0.55rem] font-semibold tracking-[0.16em] uppercase text-blue-400">
                Just now
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-400/15 border border-blue-400/20 px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wider text-blue-400 shadow-3xs">
                new
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="space-y-4">
        {/* Incoming bubble */}
        <div className="flex flex-col gap-1.5 mr-auto max-w-[85%]">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-t-[1.15rem] rounded-r-[1.15rem] rounded-bl-[0.25rem] px-4.5 py-3">
            <p className="text-[13px] leading-relaxed text-white/95">
              How do you stay creative without burning out?
            </p>
          </div>
          <span className="text-[0.55rem] font-semibold tracking-[0.16em] uppercase text-white/40 pl-2">
            Anonymous
          </span>
        </div>

        {/* Animated Typing reply bubble matching components/message-card.tsx outbound styling */}
        <div className="flex flex-col gap-1.5 ml-auto max-w-[85%] items-end">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#00b9ff]/15 border border-[#00b9ff]/30 rounded-t-[1.15rem] rounded-l-[1.15rem] rounded-br-[0.25rem] px-4.5 py-3 text-left w-full shadow-lg"
          >
            <motion.p
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5, ease: "linear" }}
              className="text-[13px] leading-relaxed text-[#00b9ff] border-r border-[#00b9ff] pr-0.5 overflow-hidden whitespace-nowrap"
            >
              I step away from the screen and take a walk.
            </motion.p>
          </motion.div>
          <div className="flex items-center gap-2 pr-2">
            <span className="text-[0.55rem] font-semibold tracking-[0.16em] uppercase text-[#00b9ff]">
              Published reply
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HowItWorksTimeline() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const viewportCenter = window.innerHeight / 2;
      let closestStep = 0;
      let minDistance = Infinity;

      stepRefs.current.forEach((ref, idx) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        // Calculate center point of the step block relative to viewport top
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestStep = idx;
        }
      });

      setActiveStep(closestStep);
    };

    // Capture scroll events at the capture phase to listen to nested overflow-y-auto elements
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    window.addEventListener("resize", handleScroll);
    
    // Trigger on load
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="relative w-full mt-16 space-y-24">
      {steps.map((step, idx) => {
        const isActive = idx === activeStep;
        return (
          <div
            key={step.count}
            ref={(el) => {
              stepRefs.current[idx] = el;
            }}
            className="w-full flex gap-6 relative transition-all duration-700 ease-out flex-col justify-center border-b border-white/[0.03] pb-20 last:border-0"
            style={{
              opacity: isActive ? 1 : 0.25,
              transform: isActive ? "scale(1)" : "scale(0.98)"
            }}
          >
            <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-8 items-start">
              {/* Left Side: Large, thin elegant step count */}
              <div className="pt-0.5 select-none font-mono text-3xl font-light tracking-tighter">
                <span className={`transition-colors duration-700 ${isActive ? "text-white font-normal" : "text-[#777672]/15"}`}>
                  {step.count}
                </span>
              </div>

              {/* Right Side: Step Title & Content */}
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  {step.count === "01" && <AnimatedStepLinkIcon />}
                  {step.count === "02" && <AnimatedStepInboxIcon />}
                  {step.count === "03" && <AnimatedStepBubbleIcon />}
                  <h3
                    className={`text-lg font-medium tracking-tight transition-colors duration-500 ${
                      isActive ? "text-[#f1efed]" : "text-[#888681]"
                    }`}
                  >
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm leading-7 text-[#85827e] transition-colors duration-300 max-w-md">
                  {step.body}
                </p>

                {/* Inline Mock Preview: Centered directly below the description, always rendered, no layout shifts */}
                <div className="mt-8 bg-[#0d0d0e]/40 border border-white/[0.05] rounded-2xl p-6 shadow-lg flex justify-center items-center max-w-sm w-full transition-all duration-500">
                  <MockPreviewContent step={idx} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
