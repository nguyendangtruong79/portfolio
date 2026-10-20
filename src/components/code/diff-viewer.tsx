"use client";

import { useState } from "react";
import { Code2, Copy, Check, FileCode, ArrowLeftRight, Terminal } from "lucide-react";
import { refactors, type RefactorSample } from "@/data/refactors";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { useToast } from "@/components/providers/toast-provider";
import { cn } from "@/lib/cn";

export function DiffViewer() {
  const [selectedSample, setSelectedSample] = useState<RefactorSample>(refactors[0]);
  const [viewMode, setViewMode] = useState<"after" | "before" | "split">("split");
  const { copy } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    void copy(code, "Code snippet");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderCodeLines = (code: string, type: "before" | "after") => {
    const lines = code.trim().split("\n");
    const isBefore = type === "before";
    return (
      <div className="font-mono text-xs leading-relaxed">
        {lines.map((line, idx) => {
          const isRemoved = line.startsWith("// ❌") || line.includes("survives") || line.includes("nuke everything");
          const isAdded = line.startsWith("// ✅") || line.includes("structurally part") || line.includes("surgical, scoped");
          return (
            <div
              key={idx}
              className={cn(
                "flex items-start px-3 py-0.5 hover:bg-surface-2/40 transition-colors",
                isRemoved && isBefore && "text-rose-400",
                isAdded && !isBefore && "bg-emerald-500/10 text-emerald"
              )}
            >
              <span className="w-8 select-none text-right font-mono text-muted pr-4 text-[11px]">
                {idx + 1}
              </span>
              <span className="select-none pr-2 font-mono text-[11px] text-muted">
                {isBefore ? "-" : "+"}
              </span>
              <span className="whitespace-pre overflow-x-auto text-fg-dim font-mono">
                {line}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section id="code" aria-labelledby="code-heading" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <div className="flex flex-col items-start gap-2">
        <p className="eyebrow flex items-center gap-2">
          <Code2 className="size-4 text-emerald" aria-hidden />
          Architectural Refactoring & Type-Safety
        </p>
        <h2 id="code-heading" className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Before & After Architectural Diffs
        </h2>
        <p className="mt-1 max-w-2xl text-base text-fg-dim">
          Real diffs demonstrating how structural redesigns prevent catastrophic bugs at compile-time and drastically cut render cascades.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-line pb-4">
        {refactors.map((item) => {
          const isSelected = item.id === selectedSample.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedSample(item)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-medium transition-all",
                isSelected
                  ? "border border-emerald bg-surface-2 text-emerald shadow-sm"
                  : "border border-transparent text-fg-dim hover:border-line hover:text-fg"
              )}
            >
              <FileCode className="size-3.5" aria-hidden />
              <span>{item.title}</span>
              <span className="pill text-[9px] text-muted">{item.project}</span>
            </button>
          );
        })}
      </div>

      <SpotlightCard className="mt-6 overflow-hidden p-0">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface/80 px-5 py-3 text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="size-3.5 text-emerald" aria-hidden />
            <span className="font-mono text-fg font-medium">{selectedSample.file}</span>
            <span className="text-muted">·</span>
            <span className="pill text-[10px] text-muted">{selectedSample.project}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="hidden sm:flex rounded-md border border-line bg-surface-2 p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={cn(
                  "rounded px-2 py-1 transition-colors",
                  viewMode === "split" ? "bg-surface text-fg font-semibold" : "text-fg-dim hover:text-fg"
                )}
              >
                Split
              </button>
              <button
                type="button"
                onClick={() => setViewMode("before")}
                className={cn(
                  "rounded px-2 py-1 transition-colors",
                  viewMode === "before" ? "bg-surface text-rose-400 font-semibold" : "text-fg-dim hover:text-fg"
                )}
              >
                Before
              </button>
              <button
                type="button"
                onClick={() => setViewMode("after")}
                className={cn(
                  "rounded px-2 py-1 transition-colors",
                  viewMode === "after" ? "bg-surface text-emerald font-semibold" : "text-fg-dim hover:text-fg"
                )}
              >
                After (Production)
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(selectedSample.after)}
              className="btn btn-ghost h-7 px-2 text-[11px] font-mono"
            >
              {copied ? <Check className="size-3 text-emerald" /> : <Copy className="size-3 text-muted" />}
              <span>{copied ? "Copied" : "Copy Solution"}</span>
            </button>
          </div>
        </div>

        {/* Architectural summary callout */}
        <div className="border-b border-line bg-obsidian/40 px-5 py-3 text-xs text-fg-dim">
          <span className="font-semibold text-emerald">Architectural Rationale: </span>
          {selectedSample.summary}
        </div>

        {/* Code Content */}
        <div className="overflow-x-auto bg-obsidian py-3">
          {viewMode === "split" ? (
            <div className="grid grid-cols-1 divide-y divide-line lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <div>
                <div className="flex items-center gap-2 border-b border-line/60 bg-surface/30 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-rose-400">
                  <span className="size-2 rounded-full bg-rose-500" />
                  Previous Architecture (Vulnerable / Unoptimized)
                </div>
                <div className="pt-2">{renderCodeLines(selectedSample.before, "before")}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 border-b border-line/60 bg-surface/30 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald">
                  <span className="size-2 rounded-full bg-emerald" />
                  Target Architecture (Isolated / High-Performance)
                </div>
                <div className="pt-2">{renderCodeLines(selectedSample.after, "after")}</div>
              </div>
            </div>
          ) : viewMode === "before" ? (
            <div>
              <div className="flex items-center gap-2 border-b border-line/60 bg-surface/30 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-rose-400">
                <span className="size-2 rounded-full bg-rose-500" />
                Previous Architecture
              </div>
              <div className="pt-2">{renderCodeLines(selectedSample.before, "before")}</div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 border-b border-line/60 bg-surface/30 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald">
                <span className="size-2 rounded-full bg-emerald" />
                Target Architecture (Production Solution)
              </div>
              <div className="pt-2">{renderCodeLines(selectedSample.after, "after")}</div>
            </div>
          )}
        </div>
      </SpotlightCard>
    </section>
  );
}
