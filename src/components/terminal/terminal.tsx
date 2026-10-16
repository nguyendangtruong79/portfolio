"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { profile } from "@/data/profile";
import { useToast } from "@/components/providers/toast-provider";
import { useUI } from "@/components/providers/ui-provider";
import { commandNames, runCommand } from "./commands";
import {
  setInterviewAuthSession,
  isInterviewAuthenticated,
  sha256Hex,
  INTERVIEW_HASH,
} from "@/lib/interview-auth";

interface Line {
  id: number;
  node: ReactNode;
}

interface TerminalProps {
  className?: string;
  /** Height-constrained output area classes (fixed height → zero CLS) */
  bodyClassName?: string;
  onClose?: () => void;
  autoFocus?: boolean;
  quickCommands?: string[];
}

const DEFAULT_QUICK = [
  "/interview",
  "cat skills.json",
  "git log --oneline",
  "contact --direct",
  "help",
];

export function Prompt() {
  return (
    <span className="shrink-0 select-none">
      <span className="text-emerald">{profile.handle}@portfolio</span>
      <span className="text-muted">:</span>
      <span className="text-cyan">~</span>
      <span className="text-muted">$</span>
    </span>
  );
}

export function Terminal({
  className,
  bodyClassName,
  onClose,
  autoFocus,
  quickCommands = DEFAULT_QUICK,
}: TerminalProps) {
  const router = useRouter();
  const { copy } = useToast();
  const { openProject, scrollTo } = useUI();
  const inputId = useId();
  const seq = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);

  // Security password gateway state
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const [lines, setLines] = useState<Line[]>(() => [
    {
      id: 0,
      node: (
        <span className="text-muted">
          portfolio-sh v2.6.0 — type <span className="text-emerald">help</span> or{" "}
          <span className="text-cyan">/interview</span> to begin.
        </span>
      ),
    },
  ]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, isPasswordMode]);

  const handlePasswordSubmit = async (entered: string) => {
    const maskedEcho = "*".repeat(entered.length || 1);
    const echoLine: Line = {
      id: ++seq.current,
      node: (
        <span className="flex gap-2">
          <span className="text-amber-400 select-none">[sudo] password:</span>
          <span className="text-fg tracking-widest">{maskedEcho}</span>
        </span>
      ),
    };

    const hash = await sha256Hex(entered.trim());

    if (hash === INTERVIEW_HASH) {
      const successLine: Line = {
        id: ++seq.current,
        node: (
          <div className="space-y-1">
            <p className="text-emerald font-semibold">
              ✓ Password verified. Access granted to Confidential Interview Dossier.
            </p>
            <p className="text-cyan">
              Decrypting candidate briefing room &amp; redirecting to /interview...
            </p>
          </div>
        ),
      };

      setLines((prev) => [...prev, echoLine, successLine]);
      setInterviewAuthSession();
      setIsPasswordMode(false);
      setPasswordValue("");
      setInput("");

      setTimeout(() => {
        onClose?.();
        router.push("/interview");
      }, 750);
    } else {
      const errorLine: Line = {
        id: ++seq.current,
        node: (
          <span className="text-rose-400">
            ✗ Authentication failed: Invalid password. Session locked. Type <span className="text-emerald">/interview</span> to retry.
          </span>
        ),
      };

      setLines((prev) => [...prev, echoLine, errorLine]);
      setIsPasswordMode(false);
      setPasswordValue("");
      setInput("");
    }
  };

  const execute = (raw: string) => {
    const trimmed = raw.trim();
    const normalized = trimmed.toLowerCase();

    // Check for interview gateway triggers
    if (normalized === "/interview" || normalized === "/inverview" || normalized === "interview") {
      const echo: Line = {
        id: ++seq.current,
        node: (
          <span className="flex gap-2">
            <Prompt />
            <span className="text-fg">{raw}</span>
          </span>
        ),
      };

      // If session is already authenticated, redirect directly without asking password again
      if (isInterviewAuthenticated()) {
        const authedLine: Line = {
          id: ++seq.current,
          node: (
            <div className="space-y-1">
              <p className="text-emerald font-semibold">
                ✓ Session active: Authenticated credentials verified from session storage.
              </p>
              <p className="text-cyan">
                Entering interview briefing room...
              </p>
            </div>
          ),
        };

        setLines((prev) => [...prev, echo, authedLine]);
        setInput("");
        setTimeout(() => {
          onClose?.();
          router.push("/interview");
        }, 500);
        return;
      }

      // If not yet authenticated, request password
      const promptLine: Line = {
        id: ++seq.current,
        node: (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 my-1 text-xs">
            <p className="text-amber-300 font-semibold flex items-center gap-1.5">
              <span>🔒 SECURITY GATEWAY: Confidential Interview Briefing Room</span>
            </p>
            <p className="text-fg-dim mt-0.5">
              Restricted area for Engineering Managers &amp; CTOs. Please enter the access password:
            </p>
          </div>
        ),
      };

      setLines((prev) => [...prev, echo, promptLine]);
      setIsPasswordMode(true);
      setPasswordValue("");
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 60);
      return;
    }

    const nextHistory = trimmed ? [...history, trimmed] : history;
    const result = runCommand(raw, {
      copy,
      openProject,
      scrollTo,
      close: onClose,
      history: nextHistory,
    });

    const echo: Line = {
      id: ++seq.current,
      node: (
        <span className="flex gap-2">
          <Prompt />
          <span className="text-fg">{raw}</span>
        </span>
      ),
    };

    const out = result.output.map((node) => ({ id: ++seq.current, node }));
    setLines((prev) => (result.clear ? [] : [...prev, echo, ...out]));
    setHistory(nextHistory);
    setCursor(null);
    setInput("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isPasswordMode) {
        void handlePasswordSubmit(passwordValue);
      } else {
        execute(input);
      }
    } else if (!isPasswordMode && e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(history[next]);
    } else if (!isPasswordMode && e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor === null) return;
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(null);
        setInput("");
      } else {
        setCursor(next);
        setInput(history[next]);
      }
    } else if (!isPasswordMode && e.key === "Tab") {
      if (!input) return;
      e.preventDefault();
      const matches = commandNames.filter((c) => c.startsWith(input));
      if (matches.length === 1) setInput(matches[0]);
      else if (matches.length > 1) {
        setLines((prev) => [
          ...prev,
          { id: ++seq.current, node: <span className="text-muted">{matches.join("   ")}</span> },
        ]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className={cn("flex flex-col font-mono text-[13px] leading-relaxed", className)}>
      <div
        ref={bodyRef}
        data-lenis-prevent
        onClick={() => inputRef.current?.focus()}
        className={cn("overflow-y-auto px-4 py-3 sm:px-5", bodyClassName)}
      >
        <div role="log" aria-live="polite" aria-relevant="additions" className="space-y-0.5 text-fg-dim">
          {lines.map((l) => (
            <div key={l.id} className="break-words whitespace-pre-wrap">
              {l.node}
            </div>
          ))}
        </div>

        <div className="mt-1 flex items-center gap-2">
          {isPasswordMode ? (
            <span className="shrink-0 select-none font-semibold text-amber-400">
              [sudo] password:
            </span>
          ) : (
            <Prompt />
          )}

          <label htmlFor={inputId} className="sr-only">
            {isPasswordMode ? "Password input" : "Terminal command input"}
          </label>

          {isPasswordMode ? (
            <input
              ref={inputRef}
              id={inputId}
              type="password"
              data-autofocus
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="••••••••••••"
              className="min-w-0 flex-1 bg-transparent text-emerald caret-emerald tracking-widest outline-none placeholder:text-muted/40 focus-visible:outline-none"
            />
          ) : (
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              data-autofocus={autoFocus ? "" : undefined}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="type a command… (e.g. /interview)"
              className="min-w-0 flex-1 bg-transparent text-fg caret-emerald outline-none placeholder:text-muted/50 focus-visible:outline-none"
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3 sm:px-5">
        {quickCommands.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              if (isPasswordMode) return;
              execute(c);
              inputRef.current?.focus({ preventScroll: true });
            }}
            className="pill cursor-pointer transition-colors hover:border-emerald/50 hover:text-emerald"
          >
            <span className="text-emerald/70">$</span> {c}
          </button>
        ))}
      </div>
    </div>
  );
}
