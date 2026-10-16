"use client";

import {
  ArrowRight,
  Compass,
  CornerDownLeft,
  FileDown,
  FolderGit2,
  Mail,
  Phone,
  Search,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { caseStudies } from "@/data/projects";
import { profile } from "@/data/profile";
import { Dialog } from "@/components/ui/dialog";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/brand-icons";
import { useToast } from "@/components/providers/toast-provider";
import { useUI } from "@/components/providers/ui-provider";

interface Item {
  id: string;
  group: "Navigate" | "Projects" | "Actions" | "Connect";
  label: string;
  hint?: string;
  icon: LucideIcon | typeof GitHubIcon;
  keywords?: string;
  run: () => void;
}

/** Subsequence fuzzy match → score (lower = better), -1 = no match */
function fuzzy(query: string, text: string) {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const direct = t.indexOf(q);
  if (direct >= 0) return direct;
  let ti = 0;
  let gaps = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found < 0) return -1;
    gaps += found - ti;
    ti = found + 1;
  }
  return 100 + gaps;
}

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen } = useUI();
  return (
    <Dialog
      open={paletteOpen}
      onClose={() => setPaletteOpen(false)}
      labelledBy="cmdk-title"
      placement="top"
      className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface/95 shadow-2xl shadow-black/60 backdrop-blur-xl"
    >
      <PaletteBody />
    </Dialog>
  );
}

function PaletteBody() {
  const { setPaletteOpen, setTerminalOpen, openProject, scrollTo } = useUI();
  const { copy } = useToast();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const items = useMemo<Item[]>(() => {
    const close = () => setPaletteOpen(false);
    const nav = (id: string, label: string, hint: string): Item => ({
      id: `nav-${id}`,
      group: "Navigate",
      label,
      hint,
      icon: Compass,
      run: () => {
        close();
        scrollTo(id);
      },
    });
    return [
      nav("impact", "Dual-Core Impact", "#impact"),
      nav("work", "Featured Works", "#work"),
      nav("metrics", "Metrics Dashboard", "#metrics"),
      nav("code", "Refactor Diff Viewer", "#code"),
      nav("playground", "CLI Playground", "#playground"),
      nav("contact", "Direct Connect", "#contact"),
      ...caseStudies.map<Item>((p) => ({
        id: `proj-${p.id}`,
        group: "Projects",
        label: `${p.name}`,
        hint: p.org,
        icon: FolderGit2,
        keywords: p.stack.join(" "),
        run: () => {
          close();
          openProject(p.id);
        },
      })),
      {
        id: "act-terminal",
        group: "Actions",
        label: "Open terminal drawer",
        hint: "Ctrl `",
        icon: SquareTerminal,
        keywords: "cli shell console",
        run: () => {
          close();
          setTerminalOpen(true);
        },
      },
      {
        id: "act-resume",
        group: "Actions",
        label: "Download resume (PDF)",
        icon: FileDown,
        keywords: "cv",
        run: () => {
          close();
          window.open(profile.resumeUrl, "_blank", "noopener");
        },
      },
      {
        id: "act-email",
        group: "Connect",
        label: "Copy email address",
        hint: profile.email,
        icon: Mail,
        run: () => {
          close();
          void copy(profile.email, "Email");
        },
      },
      {
        id: "act-phone",
        group: "Connect",
        label: "Copy phone number",
        hint: profile.phone,
        icon: Phone,
        run: () => {
          close();
          void copy(profile.phone, "Phone");
        },
      },
      {
        id: "act-github",
        group: "Connect",
        label: "Open GitHub",
        icon: GitHubIcon,
        run: () => {
          close();
          window.open(profile.socials.github, "_blank", "noopener");
        },
      },
      {
        id: "act-linkedin",
        group: "Connect",
        label: "Open LinkedIn",
        icon: LinkedInIcon,
        run: () => {
          close();
          window.open(profile.socials.linkedin, "_blank", "noopener");
        },
      },
    ];
  }, [copy, openProject, scrollTo, setPaletteOpen, setTerminalOpen]);

  const results = useMemo(() => {
    if (!query) return items;
    return items
      .map((it) => ({ it, s: fuzzy(query, `${it.label} ${it.hint ?? ""} ${it.keywords ?? ""}`) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => a.s - b.s)
      .map((x) => x.it);
  }, [items, query]);

  const activeIndex = Math.min(active, Math.max(0, results.length - 1));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((activeIndex + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((activeIndex - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[activeIndex]?.run();
    }
  };

  // Group while preserving ranked order (only group when not searching)
  const groups = query
    ? [{ name: "Results", list: results }]
    : (["Navigate", "Projects", "Actions", "Connect"] as const).map((g) => ({
        name: g,
        list: results.filter((r) => r.group === g),
      }));

  let flat = -1;

  return (
    <>
      <h2 id="cmdk-title" className="sr-only">
        Command palette
      </h2>
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search className="size-4 shrink-0 text-muted" aria-hidden />
        <input
          data-autofocus
          role="combobox"
          aria-expanded="true"
          aria-controls="cmdk-list"
          aria-activedescendant={results[activeIndex] ? `cmdk-${results[activeIndex].id}` : undefined}
          aria-autocomplete="list"
          aria-label="Search commands"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search sections, projects, actions…"
          className="h-14 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-muted focus-visible:outline-none"
        />
        <kbd className="kbd">esc</kbd>
      </div>
      <ul id="cmdk-list" role="listbox" aria-label="Commands" className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
        {results.length === 0 && (
          <li className="px-3 py-10 text-center font-mono text-sm text-muted">
            No results for “{query}”
          </li>
        )}
        {groups.map(
          (g) =>
            g.list.length > 0 && (
              <li key={g.name} role="presentation">
                <p className="px-3 pt-3 pb-1.5 font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
                  {g.name}
                </p>
                <ul role="presentation">
                  {g.list.map((it) => {
                    flat += 1;
                    const idx = flat;
                    const selected = idx === activeIndex;
                    const Icon = it.icon;
                    return (
                      <li
                        key={it.id}
                        id={`cmdk-${it.id}`}
                        role="option"
                        aria-selected={selected}
                        onMouseMove={() => setActive(idx)}
                        onClick={it.run}
                        className={cn(
                          "group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                          selected ? "bg-surface-2 text-fg" : "text-fg-dim",
                        )}
                      >
                        {selected && (
                          <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-emerald" />
                        )}
                        <Icon className={cn("size-4 shrink-0", selected ? "text-emerald" : "text-muted")} aria-hidden />
                        <span className="flex-1 truncate">{it.label}</span>
                        {it.hint && <span className="truncate font-mono text-[11px] text-muted">{it.hint}</span>}
                        {selected ? (
                          <CornerDownLeft className="size-3.5 text-emerald" aria-hidden />
                        ) : (
                          <ArrowRight className="size-3.5 opacity-0" aria-hidden />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ),
        )}
      </ul>
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <kbd className="kbd">↑</kbd>
          <kbd className="kbd">↓</kbd> navigate
          <kbd className="kbd ml-2">↵</kbd> select
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="kbd">⌘</kbd>
          <kbd className="kbd">K</kbd> toggle
        </span>
      </div>
    </>
  );
}
