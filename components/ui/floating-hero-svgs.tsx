"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export function FloatingHeroSvgs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTarget, setScrollTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Find the closest parent with overflow-y-auto
      const parent = containerRef.current.closest(".overflow-y-auto") as HTMLElement;
      if (parent) {
        setScrollTarget(parent);
      }
    }
  }, []);

  const { scrollYProgress } = useScroll({
    container: scrollTarget ? { current: scrollTarget } : undefined,
  });

  // SVG 1: Top-Left (Paper Airplane) -> drifts left/up, rotates slightly, fades
  const y1 = useTransform(scrollYProgress, [0, 0.4], [0, -80]);
  const x1 = useTransform(scrollYProgress, [0, 0.4], [0, -60]);
  const rotate1 = useTransform(scrollYProgress, [0, 0.4], [0, -30]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  // SVG 2: Top-Right (Envelope) -> drifts right/up, rotates, fades
  const y2 = useTransform(scrollYProgress, [0, 0.4], [0, -70]);
  const x2 = useTransform(scrollYProgress, [0, 0.4], [0, 60]);
  const rotate2 = useTransform(scrollYProgress, [0, 0.4], [0, 25]);
  const opacity2 = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  // SVG 3: Bottom-Right (Speech Bubble) -> drifts right/down, rotates, fades
  const y3 = useTransform(scrollYProgress, [0, 0.4], [0, 80]);
  const x3 = useTransform(scrollYProgress, [0, 0.4], [0, 70]);
  const rotate3 = useTransform(scrollYProgress, [0, 0.4], [0, 30]);
  const opacity3 = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  // SVG 4: Bottom-Left (Heart) -> drifts left/down, rotates, fades
  const y4 = useTransform(scrollYProgress, [0, 0.4], [0, 90]);
  const x4 = useTransform(scrollYProgress, [0, 0.4], [0, -70]);
  const rotate4 = useTransform(scrollYProgress, [0, 0.4], [0, -25]);
  const opacity4 = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none select-none">
      {/* Floating context-relevant SVG 1: Rich paper airplane (Sky Blue to Emerald) */}
      <motion.div
        style={{ y: y1, x: x1, rotate: rotate1, opacity: opacity1 }}
        className="absolute -top-10 left-4 sm:-top-12 sm:left-2 md:-left-4 lg:-top-14 lg:-left-20 xl:-left-28 pointer-events-none select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.3, y: -40, x: -40 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 drop-shadow-[0_4px_12px_rgba(0,185,255,0.3)]"
            >
              <defs>
                <linearGradient id="plane-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
                <linearGradient id="plane-grad-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path d="M28 4L4 14.5L14 18L28 4Z" fill="url(#plane-grad-secondary)" stroke="url(#plane-grad-primary)" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M28 4L18 24.5L14 18L28 4Z" fill="url(#plane-grad-secondary)" stroke="url(#plane-grad-primary)" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M14 18L17 21L28 4L14 18Z" fill="url(#plane-grad-primary)" fillOpacity="0.15" />
              <path d="M14 18L16.5 22L17.5 19" stroke="url(#plane-grad-primary)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating context-relevant SVG 2: Rich open envelope (Amber to Orange) */}
      <motion.div
        style={{ y: y2, x: x2, rotate: rotate2, opacity: opacity2 }}
        className="absolute -top-8 right-4 sm:-top-10 sm:right-2 md:-right-4 lg:-top-12 lg:-right-16 xl:-right-24 pointer-events-none select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.3, y: -40, x: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={{ y: [0, -9, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          >
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 drop-shadow-[0_4px_12px_rgba(255,90,0,0.3)]"
            >
              <defs>
                <linearGradient id="env-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
                <linearGradient id="env-grad-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F87171" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path d="M6 12C6 10.8954 6.89543 10 8 10H24C25.1046 10 26 10.8954 26 12V24C26 25.1046 25.1046 26 24 26H8C6.89543 26 6 25.1046 6 24V12Z" fill="url(#env-grad-secondary)" stroke="url(#env-grad-primary)" strokeWidth="1.2" />
              <rect x="10" y="6" width="12" height="9" rx="1.5" fill="#FFF" fillOpacity="0.15" stroke="url(#env-grad-primary)" strokeWidth="1" />
              <line x1="12" y1="9" x2="20" y2="9" stroke="url(#env-grad-primary)" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="12" y1="11.5" x2="17" y2="11.5" stroke="url(#env-grad-primary)" strokeWidth="0.8" strokeLinecap="round" />
              <path d="M6 26L16 16.5L26 26H6Z" fill="url(#env-grad-secondary)" stroke="url(#env-grad-primary)" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M6 12.5L14.5 19L6 25.5" stroke="url(#env-grad-primary)" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M26 12.5L17.5 19L26 25.5" stroke="url(#env-grad-primary)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating context-relevant SVG 3: Rich speech bubble with dots (Pink to Purple) */}
      <motion.div
        style={{ y: y3, x: x3, rotate: rotate3, opacity: opacity3 }}
        className="absolute -bottom-10 right-4 sm:-bottom-12 sm:right-2 md:-right-4 lg:-bottom-14 lg:-right-20 xl:-right-28 pointer-events-none select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.3, y: 40, x: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6,
            }}
          >
            <svg
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-15 lg:h-15 xl:w-18 xl:h-18 drop-shadow-[0_4px_12px_rgba(236,72,153,0.3)]"
            >
              <defs>
                <linearGradient id="bubble-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <linearGradient id="bubble-grad-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F472B6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path d="M8 24.5C8 24.5 5 27.5 4 29C4 29 4 26 4 24.5C4 23.5 3 22 3 20C3 12.268 9.26801 6 17 6C24.732 6 31 12.268 31 20C31 27.732 24.732 34 17 34C13.5 34 10.5 32.5 8.5 30.5L8 24.5Z" fill="url(#bubble-grad-secondary)" stroke="url(#bubble-grad-primary)" strokeWidth="1.2" strokeLinejoin="round" />
              <circle cx="12" cy="20" r="1.5" fill="url(#bubble-grad-primary)" />
              <circle cx="17" cy="20" r="1.5" fill="url(#bubble-grad-primary)" />
              <circle cx="22" cy="20" r="1.5" fill="url(#bubble-grad-primary)" />
              <path d="M10 10C12.5 8 16.5 7.5 19 8" stroke="#FFF" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.3" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating context-relevant SVG 4: Rich feedback heart (Crimson to Rose) */}
      <motion.div
        style={{ y: y4, x: x4, rotate: rotate4, opacity: opacity4 }}
        className="absolute -bottom-8 left-4 sm:-bottom-10 sm:left-2 md:-left-4 lg:-bottom-12 lg:-left-16 xl:-left-24 pointer-events-none select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.3, y: 40, x: -40 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.9,
            }}
          >
            <svg
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 drop-shadow-[0_4px_12px_rgba(244,63,94,0.3)]"
            >
              <defs>
                <linearGradient id="heart-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F43F5E" />
                  <stop offset="100%" stopColor="#FDA4AF" />
                </linearGradient>
                <linearGradient id="heart-grad-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FB7185" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FECDD3" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path d="M14 24.5L12.45 23.09C6.95 18.09 3.33 14.8 3.33 10.77C3.33 7.47 5.92 4.88 9.22 4.88C11.08 4.88 12.87 5.75 14 7.12C15.13 5.75 16.92 4.88 18.78 4.88C22.08 4.88 24.67 7.47 24.67 10.77C24.67 14.8 21.05 18.09 15.55 23.09L14 24.5Z" fill="url(#heart-grad-secondary)" stroke="url(#heart-grad-primary)" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M7 9C8.2 6.8 10.5 6.2 12 6.5" stroke="#FFF" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.45" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
