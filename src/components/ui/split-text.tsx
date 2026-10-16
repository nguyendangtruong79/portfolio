"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";

interface SplitTextLine {
  text: string;
  className?: string;
}

interface SplitTextProps {
  lines: SplitTextLine[];
  className?: string;
  delay?: number;
  stagger?: number;
}

const container = (delay: number, stagger: number): Variants => ({
  hidden: {},
  show: { transition: { delayChildren: delay, staggerChildren: stagger } },
});

const word: Variants = {
  hidden: { y: "105%", opacity: 0, rotate: 2 },
  show: {
    y: "0%",
    opacity: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 260, damping: 28, mass: 0.9 },
  },
};

/**
 * Kinetic word-by-word reveal. Each word slides up from a clipped mask using
 * transform + opacity only. The full sentence is exposed once to assistive
 * tech via aria-label; animated fragments are aria-hidden.
 */
export function SplitText({ lines, className, delay = 0.1, stagger = 0.045 }: SplitTextProps) {
  const label = lines.map((l) => l.text).join(" ");
  return (
    <>
      <span className="sr-only">{label}</span>
      <motion.span
        aria-hidden
        className={cn("block", className)}
        variants={container(delay, stagger)}
        initial="hidden"
        animate="show"
      >
        {lines.map((line, li) => (
          <span key={li} className="block">
            {line.text.split(" ").map((w, wi) => (
              <span key={`${w}-${wi}`} className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                <motion.span variants={word} className={cn("inline-block will-change-transform", line.className)}>
                  {w}
                </motion.span>
                {"\u00A0"}
              </span>
            ))}
          </span>
        ))}
      </motion.span>
    </>
  );
}
