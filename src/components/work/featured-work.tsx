"use client";

import { ArrowUpRight, GitCommitHorizontal, Maximize2, Sparkles } from "lucide-react";
import { caseStudies } from "@/data/projects";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ArchitectureDiagram } from "./architecture-diagram";
import { useUI } from "@/components/providers/ui-provider";
import { GitHubIcon } from "@/components/ui/brand-icons";

export function FeaturedWork() {
  const { openProject } = useUI();

  return (
    <section id="work" aria-labelledby="work-heading" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <div className="flex flex-col items-start gap-2">
        <p className="eyebrow flex items-center gap-2">
          <Sparkles className="size-4 text-emerald" aria-hidden />
          Production Engineering Case Studies
        </p>
        <h2 id="work-heading" className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Mission-Critical Systems Built for Scale
        </h2>
        <p className="mt-1 max-w-2xl text-base text-fg-dim">
          Deep architectural interventions: multi-tenant isolation, telemetry offloading, zero-CLS streaming AI, and automated testing rigs.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-12">
        {caseStudies.map((project, idx) => {
          // Bento layout: First card is large span-12, subsequent are span-6
          const isPrimary = idx === 0;
          return (
            <SpotlightCard
              key={project.id}
              accent={project.accent}
              className={`flex flex-col justify-between p-6 sm:p-8 ${
                isPrimary ? "lg:col-span-12" : "lg:col-span-6"
              }`}
            >
              <div>
                {/* Meta header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
                  <div className="flex items-center gap-2 font-mono text-xs text-muted">
                    <span className="font-semibold text-emerald">[{project.index}]</span>
                    <span className="flex items-center gap-1 text-amber-300">
                      <GitCommitHorizontal className="size-3.5" aria-hidden />
                      {project.hash}
                    </span>
                    <span>·</span>
                    <span>{project.period}</span>
                  </div>
                  <span className="pill text-[10px]">{project.org}</span>
                </div>

                {/* Title & Tagline */}
                <div className="mt-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                      {project.name}
                    </h3>
                    <span className="font-mono text-xs text-fg-dim hidden sm:inline-block">
                      {project.role}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-fg-dim sm:text-base">
                    {project.tagline}
                  </p>
                </div>

                {/* Architecture Flow Preview */}
                <div className="mt-6 rounded-xl border border-line/60 bg-surface/80 p-4">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted">
                    Architecture Pipeline Preview
                  </p>
                  <ArchitectureDiagram layers={project.diagram} accent={project.accent} compact={!isPrimary} />
                </div>

                {/* Key Metrics row */}
                <div className="mt-6 grid grid-cols-3 gap-2 border-y border-line py-4">
                  {project.metrics.map((m) => (
                    <div key={m.label} className="min-w-0">
                      <p className="font-mono text-xl font-bold text-fg sm:text-2xl">
                        {m.prefix}
                        {m.value.toLocaleString("en-US")}
                        {m.suffix}
                      </p>
                      <p className="truncate font-mono text-[10px] text-muted sm:text-xs">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer: Tech pills and trigger button */}
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.slice(0, isPrimary ? 6 : 4).map((tech) => (
                    <span key={tech} className="pill text-[10px]">
                      {tech}
                    </span>
                  ))}
                  {project.stack.length > (isPrimary ? 6 : 4) && (
                    <span className="pill text-[10px] text-muted">
                      +{project.stack.length - (isPrimary ? 6 : 4)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {project.links.github && project.links.github !== "#" && (
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.name} GitHub Repository`}
                      className="btn btn-ghost h-9 px-2.5"
                    >
                      <GitHubIcon className="size-4" />
                    </a>
                  )}
                  {project.links.demo && project.links.demo !== "#" && (
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.name} Live Demo`}
                      className="btn btn-ghost h-9 px-2.5"
                    >
                      <ArrowUpRight className="size-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => openProject(project.id)}
                    className="btn btn-primary h-9 text-xs"
                  >
                    <Maximize2 className="size-3.5" aria-hidden />
                    Architectural Deep-Dive
                  </button>
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}
