"use client";

import { motion } from "framer-motion";
import { Command, SquareTerminal } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { profile } from "@/data/profile";
import { useUI } from "@/components/providers/ui-provider";
import { CoderLogo } from "@/components/ui/coder-logo";

const links = [
  { id: "impact", label: "Impact" },
  { id: "work", label: "Work" },
  { id: "code", label: "Code" },
  { id: "playground", label: "CLI" },
  { id: "contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { setPaletteOpen, setTerminalOpen, scrollTo } = useUI();
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ["hero", ...links.map((l) => l.id), "metrics"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const activeLink = active === "metrics" ? "impact" : active;

  // Protected route isolation: never render landing page navbar on /interview
  if (pathname?.startsWith("/interview")) {
    return null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        aria-label="Primary"
        className={cn(
          "flex h-12 w-full max-w-5xl items-center justify-between rounded-2xl border px-2 pl-4 transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "border-line bg-surface/75 shadow-lg shadow-black/30 backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("hero");
          }}
          className="flex items-center gap-2.5 font-mono text-sm text-fg group/brand"
        >
          <CoderLogo size="sm" />
          <span className="font-semibold tracking-tight">
            {profile.handle}
            <span className="text-emerald">.dev</span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                aria-current={activeLink === l.id ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(l.id);
                }}
                className={cn(
                  "relative isolate block rounded-lg px-3 py-1.5 text-sm transition-colors",
                  activeLink === l.id ? "text-fg" : "text-fg-dim hover:text-fg",
                )}
              >
                {activeLink === l.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-lg bg-surface-2 ring-1 ring-line"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTerminalOpen(true)}
            aria-label="Open terminal drawer"
            className="grid size-9 place-items-center rounded-lg text-fg-dim transition-colors hover:bg-surface-2 hover:text-emerald"
          >
            <SquareTerminal className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command palette"
            aria-keyshortcuts="Meta+K Control+K"
            className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface-2/70 px-3 text-xs text-fg-dim transition-colors hover:border-line-strong hover:text-fg"
          >
            <Command className="size-3.5" aria-hidden />
            <span className="font-mono">K</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
