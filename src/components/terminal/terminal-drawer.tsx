"use client";

import { SquareTerminal, X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useUI } from "@/components/providers/ui-provider";
import { Terminal } from "./terminal";

export function TerminalDrawer() {
  const { terminalOpen, setTerminalOpen } = useUI();
  const close = () => setTerminalOpen(false);

  return (
    <Dialog
      open={terminalOpen}
      onClose={close}
      labelledBy="terminal-drawer-title"
      placement="bottom"
      className="w-full max-w-5xl overflow-hidden rounded-t-2xl border border-b-0 border-line bg-[#07080c]/95 shadow-[0_-30px_80px_-20px_rgba(16,185,129,0.18)] backdrop-blur-xl"
      panelMotion={{
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { type: "spring", stiffness: 320, damping: 36 },
      }}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <h2 id="terminal-drawer-title" className="flex items-center gap-2 font-mono text-xs text-fg-dim">
            <SquareTerminal className="size-3.5 text-emerald" aria-hidden />
            portfolio-sh — zsh
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1 text-xs text-muted sm:flex">
            <kbd className="kbd">Ctrl</kbd>
            <kbd className="kbd">`</kbd>
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Close terminal"
            className="rounded-md p-1 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
      <Terminal autoFocus onClose={close} bodyClassName="h-[min(52vh,440px)]" />
    </Dialog>
  );
}
