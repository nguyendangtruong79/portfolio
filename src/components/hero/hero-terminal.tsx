"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Prompt } from "@/components/terminal/terminal";

interface Step {
  cmd: string;
  out: ReactNode[];
}

const ok = "text-emerald";
const dim = "text-muted";
const warn = "text-amber-300";

const script: Step[] = [
  {
    cmd: "git log -1 --format='%h %s'",
    out: [
      <span key="1">
        <span className={warn}>a3f9c21</span> feat(dynatax): tenant-scoped query keys × 200 hooks
      </span>,
    ],
  },
  {
    cmd: "next build --profile",
    out: [
      <span key="1"><span className={ok}>✓</span> Compiled successfully <span className={dim}>in 6.1s</span></span>,
      <span key="2"><span className={dim}>Route /app/returns ·</span> First Load JS <span className={ok}>142 kB</span> <span className={dim}>(was 258 kB)</span></span>,
      <span key="3"><span className={ok}>↓ 45%</span> initial bundle via next/dynamic viewers</span>,
    ],
  },
  {
    cmd: "bench tree --rows 10000",
    out: [
      <span key="1"><span className={dim}>react-virtual ·</span> mounted 38 / 10,000 nodes</span>,
      <span key="2"><span className={ok}>60.0 fps</span> p95 frame 11.2ms <span className={dim}>· long tasks: 0</span></span>,
    ],
  },
  {
    cmd: "lighthouse --only=perf --preset=mobile",
    out: [
      <span key="1">Performance <span className={ok}>99</span> · LCP <span className={ok}>1.1s</span> · CLS <span className={ok}>0</span> · INP <span className={ok}>48ms</span></span>,
    ],
  },
];

type Line = { id: string; node: ReactNode };

function fullTranscript(): Line[] {
  return script.flatMap((s, i) => [
    { id: `c${i}`, node: <CmdLine text={s.cmd} /> },
    ...s.out.map((o, j) => ({ id: `o${i}-${j}`, node: o })),
  ]);
}

function CmdLine({ text, typing }: { text: string; typing?: boolean }) {
  return (
    <span className="flex gap-2">
      <Prompt />
      <span className="text-fg">
        {text}
        {typing && <span aria-hidden className="ml-px inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] animate-caret bg-emerald" />}
      </span>
    </span>
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Auto-typing terminal replaying recent builds. Fixed-height → zero CLS. */
export function HeroTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView || done) return;
    if (reduce) {
      setLines(fullTranscript());
      setDone(true);
      return;
    }
    let cancelled = false;
    (async () => {
      await sleep(900);
      const acc: Line[] = [];
      for (let i = 0; i < script.length; i++) {
        const s = script[i];
        for (let c = 1; c <= s.cmd.length; c++) {
          if (cancelled) return;
          setTyping(s.cmd.slice(0, c));
          await sleep(22 + Math.random() * 38);
        }
        await sleep(260);
        if (cancelled) return;
        setTyping(null);
        acc.push({ id: `c${i}`, node: <CmdLine text={s.cmd} /> });
        setLines([...acc]);
        for (let j = 0; j < s.out.length; j++) {
          await sleep(220 + Math.random() * 200);
          if (cancelled) return;
          acc.push({ id: `o${i}-${j}`, node: s.out[j] });
          setLines([...acc]);
        }
        await sleep(520);
      }
      if (!cancelled) setDone(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [inView, reduce, done]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-line bg-obsidian/90 shadow-[0_30px_80px_-30px_rgba(16,185,129,0.25)] backdrop-blur"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="font-mono text-[11px] text-muted">~/work — live builds</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald">
          <span className="size-1.5 rounded-full bg-emerald" aria-hidden /> LIVE
        </span>
      </div>
      {/* sr users get a static transcript; animated version is decorative */}
      <div className="sr-only">
        Recent build stats: initial bundle reduced 45 percent, 10,000 tree rows at 60 frames per
        second, Lighthouse performance 99, CLS 0.
      </div>
      <div
        aria-hidden
        className="flex h-[300px] flex-col justify-end gap-0.5 overflow-hidden px-4 py-4 font-mono text-[12px] leading-relaxed text-fg-dim sm:h-[318px] sm:text-[12.5px]"
      >
        {lines.map((l) => (
          <div key={l.id} className="truncate">
            {l.node}
          </div>
        ))}
        {typing !== null ? (
          <CmdLine text={typing} typing />
        ) : (
          <CmdLine text="" typing />
        )}
      </div>
    </div>
  );
}
