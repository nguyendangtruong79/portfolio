import type { Metric } from "./projects";

export interface ImpactItem {
  title: string;
  body: string;
  tag: string;
}

export const deepTech: ImpactItem[] = [
  {
    tag: "system-design",
    title: "Multi-tenant state architecture",
    body: "200+ TanStack Query hooks scoped by orgId/clientId. Tenant isolation is a property of the type system, not a code-review checklist.",
  },
  {
    tag: "performance",
    title: "Main-thread budget discipline",
    body: "Virtualized 10k-node financial trees at a locked 60 FPS. Route-level splitting took a 4.0s load to 1.8s.",
  },
  {
    tag: "realtime",
    title: "Event-driven over polling",
    body: "Replaced HTTP polling with Pusher WebSockets wired straight into the query cache — fewer requests, fresher state.",
  },
  {
    tag: "streaming-ui",
    title: "Zero-CLS streaming renderers",
    body: "Token-streamed markdown + KaTeX with reserved layout slots. The page never jumps, no matter how fast the model talks.",
  },
];

export const leadership: ImpactItem[] = [
  {
    tag: "mentorship",
    title: "Squad of 5, shipped on contract",
    body: "Led a five-engineer frontend squad through every core identity module — on schedule, to enterprise-grade contracts.",
  },
  {
    tag: "ci-cd",
    title: "Quality gates, not heroics",
    body: "Built Azure DevOps pipelines with Vitest, RTL and Playwright. PR cycle time down 35% with zero regression escapes.",
  },
  {
    tag: "rfc",
    title: "RFC-first architecture",
    body: "Big decisions get written down: trade-offs, rollback plans and owners — reviewed async before a line of code ships.",
  },
  {
    tag: "orchestration",
    title: "Cross-functional delivery",
    body: "Translate between product, design, .NET backend and hardware teams. One contract, one source of truth, no surprises.",
  },
];

export const headlineMetrics: Metric[] = [
  { value: 45, prefix: "-", suffix: "%", label: "Initial bundle size", detail: "DynaTax AI" },
  { value: 60, prefix: "-", suffix: "%", label: "Page load time", detail: "4.0s → 1.8s · ICT" },
  { value: 10000, suffix: "+", label: "Records @ 60 FPS", detail: "Virtualized trees" },
  { value: 200, suffix: "+", label: "Tenant-scoped hooks", detail: "TanStack Query" },
  { value: 35, prefix: "-", suffix: "%", label: "PR cycle time", detail: "0 regression escapes" },
  { value: 0, label: "Tenant data leaks", detail: "BFF + client cache" },
];
