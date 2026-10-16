"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

const fmt = (n: number, decimals: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Counts up once when scrolled into view. Writes directly to the text node,
 * so a 60fps count never triggers a React render. The final value is SSR'd
 * and reserved via an invisible sizer → zero layout shift.
 */
export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.6,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const final = `${prefix}${fmt(value, decimals)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!inView) {
      el.textContent = `${prefix}${fmt(0, decimals)}${suffix}`;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = final;
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${prefix}${fmt(v, decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, decimals, prefix, suffix, duration, final]);

  return (
    <span className={`tabular relative inline-grid ${className ?? ""}`}>
      {/* sizer reserves the final width so the count never reflows */}
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {final}
      </span>
      <span className="sr-only">{final}</span>
      <span ref={ref} aria-hidden className="col-start-1 row-start-1 text-left">
        {final}
      </span>
    </span>
  );
}
