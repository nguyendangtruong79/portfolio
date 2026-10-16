"use client";

import { ArrowUpRight, CircleAlert, GitCommitHorizontal, Lightbulb, X } from "lucide-react";
import { useState } from "react";
import { caseStudies } from "@/data/projects";
import { Dialog } from "@/components/ui/dialog";
import { GitHubIcon } from "@/components/ui/brand-icons";
import { useUI } from "@/components/providers/ui-provider";
import { ArchitectureDiagram } from "./architecture-diagram";

export function ProjectModal() {
  const { activeProjectId, closeProject } = useUI();
  const current = caseStudies.find((p) => p.id === activeProjectId);
  // Keep rendering the last project while the exit animation plays
  const [last, setLast] = useState(current);
  if (current && current !== last) setLast(current);
  const project = current ?? last;

  return (
    <Dialog
      open={!!current}
      onClose={closeProject}
      labelledBy="project-modal-title"
      className="max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-2xl border border-line bg-surface shadow-2xl shadow-black/70"
    >
      {project && (
        <article>
          <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/90 px-6 py-5 backdrop-blur-xl sm:px-8">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-mono text-[11px] text-muted">
                <GitCommitHorizontal className="size-3.5 text-emerald" aria-hidden />
                <span className="text-amber-300">{project.hash}</span>
                <span>·</span>
                <span>case-study/{project.index}</span>
                <span>·</span>
                <span>{project.period}</span>
              </p>
              <h2 id="project-modal-title" className="mt-1.5 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                {project.name}
              </h2>
              <p className="mt-1 text-sm text-fg-dim">{project.role}</p>
            </div>
            <button
              type="button"
              onClick={closeProject}
              aria-label="Close case study"
              className="rounded-lg border border-line p-2 text-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              <X className="size-4" aria-hidden />
            </button>
          </header>

          <div className="space-y-10 px-6 py-8 sm:px-8">
            <section aria-labelledby="pm-context">
              <h3 id="pm-context" className="sr-only">Context</h3>
              <p className="text-lg leading-relaxed text-fg">{project.tagline}</p>
              <p className="mt-3 leading-relaxed text-fg-dim">{project.context}</p>
            </section>

            <section aria-labelledby="pm-arch">
              <h3 id="pm-arch" className="eyebrow mb-4">System architecture</h3>
              <ArchitectureDiagram layers={project.diagram} accent={project.accent} />
            </section>

            <div className="grid gap-8 lg:grid-cols-5">
              <section aria-labelledby="pm-challenge" className="lg:col-span-2">
                <h3 id="pm-challenge" className="eyebrow mb-4 !text-rose-400">The engineering challenge</h3>
                <ul className="space-y-3">
                  {project.challenges.map((c) => (
                    <li key={c} className="flex gap-3 text-sm leading-relaxed text-fg-dim">
                      <CircleAlert className="mt-0.5 size-4 shrink-0 text-rose-400/80" aria-hidden />
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
              <section aria-labelledby="pm-decisions" className="lg:col-span-3">
                <h3 id="pm-decisions" className="eyebrow mb-4">Architectural decisions</h3>
                <ol className="space-y-3">
                  {project.decisions.map((d, i) => (
                    <li key={d.title} className="rounded-xl border border-line bg-surface-2/60 p-4">
                      <p className="flex items-center gap-2 text-sm font-medium text-fg">
                        <Lightbulb className="size-4 text-emerald" aria-hidden />
                        <span className="font-mono text-xs text-muted">ADR-{String(i + 1).padStart(2, "0")}</span>
                        {d.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-fg-dim">{d.body}</p>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <section aria-labelledby="pm-impact">
              <h3 id="pm-impact" className="eyebrow mb-4">Key metrics & impact</h3>
              <ul className="grid gap-3 sm:grid-cols-3">
                {project.metrics.map((m) => (
                  <li key={m.label} className="rounded-xl border border-line bg-obsidian/60 p-4">
                    <p className="font-mono text-3xl font-semibold tracking-tight text-fg tabular">
                      {m.prefix}
                      {m.value.toLocaleString("en-US")}
                      {m.suffix}
                    </p>
                    <p className="mt-1 text-sm font-medium text-fg">{m.label}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">{m.detail}</p>
                  </li>
                ))}
              </ul>
            </section>

            <footer className="flex flex-col gap-5 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
                {project.stack.map((s) => (
                  <li key={s} className="pill">{s}</li>
                ))}
              </ul>
              <div className="flex shrink-0 gap-2">
                {project.links.github && (
                  <a href={project.links.github} className="btn btn-ghost h-9 text-xs" target="_blank" rel="noreferrer">
                    <GitHubIcon className="size-3.5" /> Source
                  </a>
                )}
                {project.links.demo && (
                  <a href={project.links.demo} className="btn btn-primary h-9 text-xs" target="_blank" rel="noreferrer">
                    Live demo <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                )}
              </div>
            </footer>
          </div>
        </article>
      )}
    </Dialog>
  );
}
