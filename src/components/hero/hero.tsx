"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, Command, FileDown } from "lucide-react";
import { profile } from "@/data/profile";
import { SplitText } from "@/components/ui/split-text";
import { useUI } from "@/components/providers/ui-provider";
import { HeroTerminal } from "./hero-terminal";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const stats = [
  ["6.5+", "yrs experience"],
  ["5", "eng. squad led"],
  ["0", "tenant leaks"],
] as const;

export function Hero() {
  const { setPaletteOpen, scrollTo } = useUI();

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative mx-auto max-w-6xl px-5 pt-36 pb-20 sm:px-8 sm:pt-44 lg:pb-28">
      <motion.p {...fadeUp(0)} className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-emerald/25 bg-surface py-1.5 pr-3.5 pl-2.5 font-mono text-xs text-emerald">
        <span className="relative flex size-2" aria-hidden>
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald" />
          <span className="relative size-2 rounded-full bg-emerald" />
        </span>
        {profile.availability}
      </motion.p>

      <h1 id="hero-title" className="max-w-5xl text-[clamp(2.4rem,6.4vw,5.25rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-fg">
        <SplitText
          lines={[
            { text: "Engineering Resilient Front-End Architectures." },
            { text: "Leading Teams from Chaos to Velocity.", className: "text-gradient" },
          ]}
        />
      </h1>

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <div>
          <motion.p {...fadeUp(0.7)} className="max-w-xl text-lg leading-relaxed text-fg-dim">
            {profile.title}. I design multi-tenant state systems, kill jank at the frame level, and
            build the CI rituals that let a squad ship enterprise software{" "}
            <span className="text-fg">fast — without regressions.</span>
          </motion.p>

          <motion.div {...fadeUp(0.85)} className="mt-9 flex flex-wrap gap-3">
            <button type="button" onClick={() => scrollTo("work")} className="btn btn-primary group">
              Explore Architecture
              <ArrowDownRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-keyshortcuts="Meta+K Control+K"
              className="btn btn-ghost"
            >
              <Command className="size-4 text-emerald" aria-hidden />
              Command Palette
              <span className="ml-1 flex gap-1" aria-hidden>
                <kbd className="kbd">⌘</kbd>
                <kbd className="kbd">K</kbd>
              </span>
            </button>
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <FileDown className="size-4 text-cyan" aria-hidden />
              Resume <span className="font-mono text-xs text-muted">[PDF]</span>
            </a>
          </motion.div>

          <motion.dl {...fadeUp(1)} className="mt-12 grid max-w-md grid-cols-3 divide-x divide-line border-y border-line">
            {stats.map(([v, l]) => (
              <div key={l} className="px-4 py-4 first:pl-0">
                <dt className="sr-only">{l}</dt>
                <dd className="font-mono text-2xl font-semibold text-fg tabular">{v}</dd>
                <dd aria-hidden className="mt-0.5 font-mono text-[11px] tracking-wide text-muted uppercase">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <HeroTerminal />
        </motion.div>
      </div>
    </section>
  );
}
