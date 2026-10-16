"use client";

import { headlineMetrics } from "@/data/impact";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Gauge } from "lucide-react";

export function MetricsDashboard() {
  return (
    <section id="metrics" aria-labelledby="metrics-heading" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <div className="flex flex-col items-start gap-2">
        <p className="eyebrow flex items-center gap-2">
          <Gauge className="size-4 text-emerald" aria-hidden />
          System Telemetry & Engineering Velocity
        </p>
        <h2 id="metrics-heading" className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Verified Performance & Scale Metrics
        </h2>
        <p className="mt-1 max-w-xl text-base text-fg-dim">
          Real numbers measured in production environments, stress tests, and automated quality pipelines.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {headlineMetrics.map((m, i) => (
          <SpotlightCard
            key={m.label}
            accent={i % 2 === 0 ? "emerald" : "cyan"}
            className="flex flex-col justify-between p-6 sm:p-7"
          >
            <div>
              <p className="font-mono text-4xl font-bold tracking-tight text-fg sm:text-5xl">
                <AnimatedCounter
                  value={m.value}
                  decimals={m.decimals ?? 0}
                  prefix={m.prefix ?? ""}
                  suffix={m.suffix ?? ""}
                />
              </p>
              <h3 className="mt-3 text-base font-medium text-fg">
                {m.label}
              </h3>
            </div>
            <p className="mt-4 border-t border-line pt-3 font-mono text-xs text-muted">
              {m.detail}
            </p>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
