"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 3,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
  } & React.HTMLAttributes<HTMLElement>
>) {
  return (
    <Tag
      className={cn(
        "relative flex rounded-full border border-white/10 content-center transition duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-hidden p-[1px] decoration-clone w-fit",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-auto text-white z-10 bg-[#1c1c1f] px-4 py-2 rounded-[inherit]",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className="flex-none absolute z-0 inset-[-300%]"
        style={{
          background: "conic-gradient(from 0deg, transparent 75%, #3B82F6 100%)",
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{ ease: "linear", duration: duration, repeat: Infinity }}
      />
    </Tag>
  );
}
