import type { ReactNode } from "react";
import { caseStudies } from "@/data/projects";
import { profile } from "@/data/profile";

export interface CommandContext {
  copy: (value: string, label: string) => Promise<void>;
  openProject: (id: string) => void;
  scrollTo: (id: string) => void;
  close?: () => void;
  history: string[];
}

export type CommandResult = { output: ReactNode[]; clear?: boolean };

const C = {
  key: "text-cyan",
  str: "text-emerald",
  num: "text-amber-300",
  dim: "text-muted",
  ok: "text-emerald",
  err: "text-rose-400",
  hl: "text-fg",
};

export const skills = {
  languages: ["TypeScript", "JavaScript", "HTML5", "CSS3", "SQL", "C# (reading)", "Dart (basics)"],
  frontend: ["React 19 / 18", "Next.js 14–16 App Router", "Vue 3 Composition API", "TanStack Query", "Zustand", "Apollo GraphQL", "Tailwind CSS", "Shadcn UI", "Framer Motion", "Pinia"],
  mobile: ["React Native (iOS & Android)", "Bridge & TurboModules", "Goong Maps API", "Offline-first resilience"],
  backend: ["Node.js BFF", ".NET/C# collaboration", "Redis (TTL 60s–900s)", "WebSockets (Pusher)", "Stripe Payments"],
  architecture: ["Micro-frontends (Module Federation, NX)", "Multi-tenant SaaS Isolation", "Virtualization (@tanstack/react-virtual)", "Zero-CLS Streaming"],
  testing_quality: ["Vitest", "Playwright (E2E)", "React Testing Library", "Azure DevOps CI/CD", "Husky / Commitlint"],
  leadership: ["Front-End Team Lead (Squad of 5)", "Engineering standards & RFCs", "Mentoring 3+ devs", "Delivery ownership"],
  certifications: ["Claude Certified Architect — Agentic Systems (2025)", "English: B2 (CEFR)"],
};

const gitLog: [string, string][] = [
  ["a3f9c21", "feat(dynatax): tenant-scoped query key factory for 200+ hooks"],
  ["e81b0d4", "perf(dynatax): virtualize financial tree — 10k rows @ 60fps"],
  ["4d2c7f9", "feat(bff): redis cache layer w/ adaptive TTL 60s–900s"],
  ["b90e113", "refactor(realtime): replace polling with pusher event stream"],
  ["7be04d9", "perf(ict): route-level splitting — LCP 4.0s → 1.8s"],
  ["19ac5e2", "feat(ict): RBAC route engine + credential lifecycle guards"],
  ["f3d66a0", "ci(ict): vitest + playwright gates on azure devops (-35% PR cycle)"],
  ["c51e8a0", "feat(infini): zero-CLS streaming markdown + KaTeX renderer"],
  ["2e7f4b8", "feat(infini): stripe subscriptions + next-intl"],
];

const sections = ["hero", "impact", "metrics", "work", "code", "playground", "contact"];

function JsonView({ data }: { data: Record<string, string[]> }) {
  const entries = Object.entries(data);
  return (
    <span>
      {"{"}
      {entries.map(([k, v], i) => (
        <span key={k} className="block pl-4">
          <span className={C.key}>&quot;{k}&quot;</span>: [
          {v.map((s, j) => (
            <span key={s}>
              <span className={C.str}>&quot;{s}&quot;</span>
              {j < v.length - 1 ? ", " : ""}
            </span>
          ))}
          ]{i < entries.length - 1 ? "," : ""}
        </span>
      ))}
      {"}"}
    </span>
  );
}

const helpRows: [string, string][] = [
  ["help", "list available commands"],
  ["/interview", "confidential interview dossier (passcode required)"],
  ["whoami", "who's behind the keyboard"],
  ["cat skills.json", "structured skill inventory"],
  ["git log --oneline", "highlights, as commits"],
  ["ls projects", "list case studies"],
  ["open <project>", "open a case study, e.g. open dynatax"],
  ["contact --direct", "copy email + show links"],
  ["goto <section>", `scroll to: ${sections.join(" | ")}`],
  ["resume", "download resume (DOCX)"],
  ["history", "previous commands"],
  ["clear", "clear the screen"],
];

export const commandNames = [
  "help",
  "/interview",
  "/inverview",
  "interview",
  "whoami",
  "cat skills.json",
  "cat about.md",
  "git log --oneline",
  "ls projects",
  ...caseStudies.map((p) => `open ${p.id}`),
  "contact --direct",
  ...sections.map((s) => `goto ${s}`),
  "resume",
  "history",
  "clear",
  "date",
  "sudo hire-me",
  "exit",
];

export function runCommand(raw: string, ctx: CommandContext): CommandResult {
  const input = raw.trim().replace(/\s+/g, " ");
  const [cmd, ...args] = input.split(" ");
  const arg = args.join(" ");

  switch (cmd) {
    case "":
      return { output: [] };
    case "help":
      return {
        output: [
          <span key="h" className={C.dim}>Available commands:</span>,
          ...helpRows.map(([c, d]) => (
            <span key={c} className="flex gap-3">
              <span className={`w-44 shrink-0 ${C.ok}`}>{c}</span>
              <span className={C.dim}>{d}</span>
            </span>
          )),
          <span key="t" className={C.dim}>Tip: Tab autocompletes, ↑/↓ walks history.</span>,
        ],
      };
    case "whoami":
      return {
        output: [
          <span key="1" className={C.hl}>{profile.name} — {profile.title}</span>,
          <span key="2" className={C.dim}>{profile.location} · {profile.yearsOfExperience} yrs exp</span>,
          <span key="3">
            High-impact Senior Frontend Engineer &amp; Tech Lead architecting scalable,
            high-concurrency enterprise web applications, multi-tenant SaaS runtimes,
            and cross-platform mobile apps. Certified Claude Architect (2025).
          </span>,
        ],
      };
    case "cat": {
      if (arg === "skills.json") return { output: [<JsonView key="j" data={skills} />] };
      if (arg === "about.md")
        return {
          output: [
            <span key="1" className={C.key}># About — {profile.name}</span>,
            <span key="2">Performance is a feature. Types are contracts. Tests are a team&apos;s memory.</span>,
            <span key="3" className={C.dim}>Led squads of 5 engineers delivering enterprise access control &amp; fintech SaaS with 0 regression escapes.</span>,
          ],
        };
      return {
        output: [<span key="e" className={C.err}>cat: {arg || "<file>"}: No such file. Try skills.json or about.md</span>],
      };
    }
    case "git":
      if (args[0] === "log")
        return {
          output: gitLog.map(([h, m]) => (
            <span key={h}>
              <span className="text-amber-300">{h}</span> {m}
            </span>
          )),
        };
      return { output: [<span key="e" className={C.err}>git: &apos;{arg}&apos; is not a git command. Try: git log --oneline</span>] };
    case "ls":
      return {
        output: caseStudies.map((p) => (
          <span key={p.id} className="flex gap-3">
            <span className={`w-28 shrink-0 ${C.key}`}>{p.id}</span>
            <span className={C.dim}>{p.name} — {p.org}</span>
          </span>
        )),
      };
    case "open": {
      const p = caseStudies.find((x) => x.id === arg || (arg.length > 1 && x.id.startsWith(arg)));
      if (!p)
        return {
          output: [<span key="e" className={C.err}>open: unknown project &apos;{arg}&apos;. Run `ls projects`.</span>],
        };
      ctx.close?.();
      ctx.openProject(p.id);
      return { output: [<span key="o" className={C.ok}>→ opening {p.name}…</span>] };
    }
    case "goto": {
      if (!sections.includes(arg))
        return { output: [<span key="e" className={C.err}>goto: sections are {sections.join(", ")}</span>] };
      ctx.close?.();
      ctx.scrollTo(arg);
      return { output: [<span key="o" className={C.ok}>→ #{arg}</span>] };
    }
    case "contact":
      if (arg === "--direct") void ctx.copy(profile.email, "Email");
      return {
        output: [
          arg === "--direct" ? (
            <span key="c" className={C.ok}>✓ {profile.email} copied to clipboard</span>
          ) : (
            <span key="c" className={C.dim}>Use `contact --direct` to copy email.</span>
          ),
          <span key="p">phone    <span className={C.hl}>{profile.phone}</span></span>,
          <span key="e">email    <a className="underline decoration-line underline-offset-4 hover:text-emerald" href={`mailto:${profile.email}`}>{profile.email}</a></span>,
          <span key="g">github   <a className="underline decoration-line underline-offset-4 hover:text-emerald" href={profile.socials.github} target="_blank" rel="noreferrer">{profile.socials.github}</a></span>,
          <span key="l">linkedin <a className="underline decoration-line underline-offset-4 hover:text-emerald" href={profile.socials.linkedin} target="_blank" rel="noreferrer">{profile.socials.linkedin}</a></span>,
        ],
      };
    case "resume":
      window.open(profile.resumeUrl, "_blank", "noopener");
      return { output: [<span key="r" className={C.ok}>↓ opening {profile.resumeUrl}</span>] };
    case "history":
      return {
        output: ctx.history.length
          ? ctx.history.map((h, i) => (
              <span key={i}>
                <span className={C.dim}>{String(i + 1).padStart(3, " ")}</span>  {h}
              </span>
            ))
          : [<span key="n" className={C.dim}>no history yet</span>],
      };
    case "date":
      return { output: [<span key="d">{new Date().toString()}</span>] };
    case "echo":
      return { output: [<span key="e">{arg}</span>] };
    case "sudo":
      return {
        output: [
          <span key="1" className={C.dim}>[sudo] password for recruiter: ********</span>,
          <span key="2" className={C.ok}>✓ Permission granted. Scheduling interview…</span>,
          <span key="3">Run `contact --direct` to finish the handshake.</span>,
        ],
      };
    case "clear":
      return { output: [], clear: true };
    case "exit":
      ctx.close?.();
      return { output: [<span key="x" className={C.dim}>bye 👋</span>] };
    default:
      return {
        output: [<span key="e" className={C.err}>command not found: {cmd}. Type `help`.</span>],
      };
  }
}
