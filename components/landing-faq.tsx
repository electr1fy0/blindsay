"use client";

import { useState } from "react";

type LandingQuestion = {
  title: string;
  answer: string;
};

type LandingFaqProps = {
  questions: readonly LandingQuestion[];
};

export function LandingFaq({ questions }: LandingFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="border-t border-white/[0.09]">
      {questions.map((question, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={question.title}
            className="group border-b border-dashed border-white/[0.11]"
          >
            <button
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between gap-8 py-7 text-left outline-none focus-visible:text-primary hover:text-[#fff] transition-colors cursor-pointer"
            >
              <span className="text-lg font-medium tracking-[-0.025em] text-[#eeecea] transition-colors group-hover:text-white">
                {question.title}
              </span>
              <span className="relative flex size-5 shrink-0 items-center justify-center text-[#716e69] group-hover:text-white transition-colors">
                <span className="absolute h-px w-4 bg-current" />
                <span
                  className="absolute h-4 w-px bg-current transition-transform duration-200"
                  style={{
                    transform: isOpen ? "scaleY(0)" : "scaleY(1)",
                  }}
                />
              </span>
            </button>
            <div
              className="grid"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                opacity: isOpen ? 1 : 0,
                transition: "grid-template-rows 250ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease-out",
              }}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-8 pr-12 text-base leading-7 text-[#96938f]">
                  {question.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
