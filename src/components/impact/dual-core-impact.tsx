"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Users, ArrowRight, ShieldCheck, Zap, GitBranch, Layers } from "lucide-react";
import { deepTech, leadership, type ImpactItem } from "@/data/impact";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { cn } from "@/lib/cn";

export function DualCoreImpact() {
  const [activeTab, setActiveTab] = useState<"tech" | "leadership">("tech");

  const icons: Record<string, typeof Cpu> = {
    "system-design": Layers,
    "performance": Zap,
    "realtime": ArrowRight,
    "streaming-ui": Cpu,
    "mentorship": Users,
    "ci-cd": GitBranch,
    "rfc": ShieldCheck,
    "orchestration": Layers,
  };

  const currentList = activeTab === "tech" ? deepTech : leadership;

  return (
    <section id="impact" aria-labelledby="impact-heading" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">The Differentiator</p>
          <h2 id="impact-heading" className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Dual-Core Impact Engine
          </h2>
          <p className="mt-3 max-w-xl text-base text-fg-dim">
            Balancing deep individual contributor excellence with high-leverage engineering leadership.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => setActiveTab("tech")}
            className={cn(
              "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "tech" ? "text-fg" : "text-fg-dim hover:text-fg"
            )}
          >
            {activeTab === "tech" && (
              <motion.span
                layoutId="impact-pill"
                className="absolute inset-0 rounded-lg bg-surface-2 ring-1 ring-line"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Cpu className="relative z-10 size-4 text-emerald" aria-hidden />
            <span className="relative z-10">Deep Tech / IC</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("leadership")}
            className={cn(
              "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "leadership" ? "text-fg" : "text-fg-dim hover:text-fg"
            )}
          >
            {activeTab === "leadership" && (
              <motion.span
                layoutId="impact-pill"
                className="absolute inset-0 rounded-lg bg-surface-2 ring-1 ring-line"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Users className="relative z-10 size-4 text-cyan" aria-hidden />
            <span className="relative z-10">Leadership & Culture</span>
          </button>
        </div>
      </div>

      <div className="mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid gap-6 sm:grid-cols-2"
          >
            {currentList.map((item: ImpactItem) => {
              const Icon = icons[item.tag] || Cpu;
              return (
                <SpotlightCard
                  key={item.title}
                  accent={activeTab === "tech" ? "emerald" : "cyan"}
                  className="flex h-full flex-col justify-between p-6 sm:p-7"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-lg border border-line bg-surface-2">
                        <Icon
                          className={cn("size-5", activeTab === "tech" ? "text-emerald" : "text-cyan")}
                          aria-hidden
                        />
                      </span>
                      <span className="pill text-[10px]">#{item.tag}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-fg">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-fg-dim">
                      {item.body}
                    </p>
                  </div>
                </SpotlightCard>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
