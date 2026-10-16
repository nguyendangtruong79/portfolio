"use client";

import { Terminal as TerminalIcon, Sparkles, Maximize2 } from "lucide-react";
import { Terminal } from "@/components/terminal/terminal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { useUI } from "@/components/providers/ui-provider";

export function CliPlayground() {
  const { setTerminalOpen } = useUI();

  return (
    <section id="playground" aria-labelledby="playground-heading" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <div className="flex flex-col items-start gap-2">
        <p className="eyebrow flex items-center gap-2">
          <TerminalIcon className="size-4 text-emerald" aria-hidden />
          Developer-Centric Runtime
        </p>
        <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 id="playground-heading" className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              Interactive Terminal Emulator
            </h2>
            <p className="mt-1 max-w-xl text-base text-fg-dim">
              Query skills, git history, and direct contacts directly via shell commands. Full tab autocompletion and command history included.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTerminalOpen(true)}
            className="btn btn-ghost h-9 self-start font-mono text-xs sm:self-end"
          >
            <Maximize2 className="size-3.5 text-emerald" aria-hidden />
            Open Floating Drawer <span className="text-muted">(Ctrl `)</span>
          </button>
        </div>
      </div>

      <SpotlightCard className="mt-8 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-line bg-surface/90 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="ml-2 font-mono text-xs text-muted">recruiter-session@portfolio-sh</span>
          </div>
          <span className="flex items-center gap-1 font-mono text-[11px] text-emerald">
            <Sparkles className="size-3" /> Ready
          </span>
        </div>

        <Terminal
          bodyClassName="h-[340px]"
          quickCommands={[
            "/interview",
            "cat skills.json",
            "git log --oneline",
            "open dynatax",
            "contact --direct",
            "sudo hire-me",
          ]}
        />
      </SpotlightCard>
    </section>
  );
}
