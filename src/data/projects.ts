export type Accent = "emerald" | "cyan";

export interface Metric {
  /** Numeric part animated by the counter */
  value: number;
  /** Decimal places to render */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  detail: string;
}

export interface DiagramLayer {
  label: string;
  nodes: string[];
}

export interface CaseStudy {
  id: string;
  index: string;
  name: string;
  org: string;
  tagline: string;
  role: string;
  context: string;
  accent: Accent;
  /** Pseudo commit hash rendered in mono metadata */
  hash: string;
  period: string;
  challenges: string[];
  decisions: { title: string; body: string }[];
  metrics: Metric[];
  stack: string[];
  diagram: DiagramLayer[];
  links: { github?: string; demo?: string };
}

export const caseStudies: CaseStudy[] = [
  {
    id: "dynatax",
    index: "01",
    name: "DynaTax AI",
    org: "Fintech · US Tax SaaS",
    tagline:
      "Multi-tenant enterprise SaaS runtime for automated US tax filing, high-concurrency document rendering & asynchronous financial stream processing.",
    role: "Senior Software Engineer — Fullstack (Next.js & Node.js)",
    context:
      "B2B2C SaaS platform serving US audit/CPA firms and SMBs, handling highly sensitive multi-tenant financial data across thousands of client entities.",
    accent: "emerald",
    hash: "a3f9c21",
    period: "2024 — Present",
    challenges: [
      "Render 10,000+ hierarchical financial tree records concurrently without dropping browser frames.",
      "Eliminate cross-tenant data leakage while thousands of tax computations and document exports run in parallel.",
      "Heavy audit documents and tax reports caused jank on load due to an oversized initial bundle.",
    ],
    decisions: [
      {
        title: "Multi-Tenant State Isolation",
        body: "Designed 200+ custom hooks on TanStack Query, every cache key hard-scoped by orgId and clientId, paired with dynamic cache invalidation to structurally eliminate cross-company leakage.",
      },
      {
        title: "Async Offloading & Redis Sync",
        body: "Built a Node.js BFF / API Gateway with a dynamic Redis caching layer (TTL 60s–900s) and background workers that move tax computation and PDF/CSV generation off the request path.",
      },
      {
        title: "Virtualization & Event Streaming",
        body: "Integrated @tanstack/react-virtual for financial tree data and replaced legacy HTTP polling with an event-driven Pusher WebSocket architecture for real-time filing status and collaboration.",
      },
    ],
    metrics: [
      {
        value: 45,
        prefix: "-",
        suffix: "%",
        label: "Initial bundle",
        detail: "Dynamic code-splitting (next/dynamic) for complex document viewer modules.",
      },
      {
        value: 60,
        suffix: " FPS",
        label: "Stable render",
        detail: "10,000+ financial tree records without blocking the main thread.",
      },
      {
        value: 0,
        label: "Tenant leaks",
        detail: "100% isolation of financial data at both BFF and client-cache layers.",
      },
    ],
    stack: [
      "Next.js App Router",
      "Node.js",
      "TypeScript",
      "TanStack Query",
      "Redis",
      "Pusher WebSockets",
      "React Virtual",
    ],
    diagram: [
      { label: "Client", nodes: ["Next.js RSC", "Tenant-scoped Query Cache", "Virtualized Tree"] },
      { label: "Edge / BFF", nodes: ["Node.js Gateway", "Tenant Guard", "Redis TTL 60–900s"] },
      { label: "Async", nodes: ["Job Queue", "Tax Workers", "PDF/CSV Render"] },
      { label: "Realtime", nodes: ["Pusher Channels", "Cache Invalidation"] },
    ],
    links: { github: "#", demo: "#" },
  },
  {
    id: "ict-identity",
    index: "02",
    name: "ICT Access & Identity",
    org: "CMC Global · Enterprise Security",
    tagline:
      "Mission-critical security access & hardware-integrated identity management suite powered by high-assurance RBAC and hybrid data orchestration.",
    role: "Front-End Team Lead — Squad of 5 Engineers",
    context:
      "Large-scale enterprise access-control and identity platform, integrated directly with peripheral hardware (camera capture, recognition streams) and a .NET backend.",
    accent: "cyan",
    hash: "7be04d9",
    period: "2022 — 2024",
    challenges: [
      "Initial page load hit 4.0s from heavy third-party libraries and an unoptimized architecture.",
      "UI jitter and cascading re-renders from high-frequency hardware telemetry colliding with remote identity sync.",
      "Manual review and release flow stretched PR cycles and let regressions slip through.",
    ],
    decisions: [
      {
        title: "Hybrid Data Layering",
        body: "Strictly separated data planes: Apollo Client (GraphQL) & Axios for remote identity caching, Zustand for high-frequency camera telemetry and hardware upload streams — eliminating cascading renders.",
      },
      {
        title: "Granular RBAC Route Engine",
        body: "Real-time role-based route guards managing credential lifecycle (start / expiry), tightly integrated with the Identity Provider.",
      },
      {
        title: "Engineering CI/CD Automation",
        body: "Automated quality gates on Azure DevOps with comprehensive suites: Vitest, React Testing Library and Playwright E2E.",
      },
    ],
    metrics: [
      {
        value: 60,
        prefix: "-",
        suffix: "%",
        label: "Page load",
        detail: "4.0s → 1.8s via Vite route-level splitting and decoupled components.",
      },
      {
        value: 35,
        prefix: "-",
        suffix: "%",
        label: "PR cycle time",
        detail: "Zero regression escapes thanks to automated Vitest + Playwright gates.",
      },
      {
        value: 5,
        label: "Engineer squad",
        detail: "Delivered every core identity module on schedule to enterprise contracts.",
      },
    ],
    stack: [
      "React 18",
      "TypeScript",
      "Vite",
      "Apollo GraphQL",
      "Zustand",
      "Tailwind CSS",
      "Vitest",
      "Playwright",
      "Azure DevOps",
    ],
    diagram: [
      { label: "Hardware", nodes: ["Camera Capture", "Recognition Stream"] },
      { label: "Client State", nodes: ["Zustand Telemetry", "Apollo Identity Cache"] },
      { label: "Access", nodes: ["RBAC Route Engine", "Credential Lifecycle"] },
      { label: "Backend", nodes: [".NET GraphQL", "Identity Provider"] },
    ],
    links: { github: "#" },
  },
  {
    id: "infini",
    index: "03",
    name: "Infini AI",
    org: "AI · Academic Research",
    tagline:
      "High-performance, streaming-first academic intelligence interface with real-time math/document rendering and agentic AI UX.",
    role: "Core Frontend & AI System Architect",
    context:
      "AI research assistant streaming long-form markdown, LaTeX math and PDFs to researchers, with billing and i18n built-in.",
    accent: "emerald",
    hash: "c51e8a0",
    period: "2025",
    challenges: [
      "Latency and layout jumps while streaming markdown with complex KaTeX math in real time from the AI engine.",
      "A unified design system with fluid micro-interactions and i18n — without sacrificing response speed.",
    ],
    decisions: [
      {
        title: "RSC & Next.js 15 Engine",
        body: "React Server Components and React 19 on the Next.js 15 App Router to optimize TTFB and shrink client-side work.",
      },
      {
        title: "Streaming Math/Markdown Engine",
        body: "A stream-optimized parser for KaTeX plus a multi-format PDF viewer, holding CLS at 0 while tokens arrive continuously.",
      },
      {
        title: "Monetization & i18n End-to-End",
        body: "Full Stripe billing portal & subscriptions, next-intl localization, quality enforced by Husky/Commitlint pipelines.",
      },
    ],
    metrics: [
      {
        value: 60,
        suffix: " FPS",
        label: "Transitions",
        detail: "Sub-frame fluidity with Framer Motion and Shadcn UI patterns.",
      },
      {
        value: 0,
        label: "Runtime validation errors",
        detail: "Zod + React Hook Form architecture for complex research inputs.",
      },
      {
        value: 0,
        label: "CLS while streaming",
        detail: "Layout reserved ahead of tokens; math blocks measured before paint.",
      },
    ],
    stack: [
      "Next.js 15",
      "React 19",
      "Framer Motion",
      "Shadcn UI",
      "Zustand",
      "KaTeX",
      "Stripe",
      "Playwright",
    ],
    diagram: [
      { label: "Server", nodes: ["RSC Shell", "Streaming Route"] },
      { label: "Stream", nodes: ["Token Buffer", "Markdown + KaTeX Parser"] },
      { label: "Client", nodes: ["Stable Layout Slots", "PDF Viewer"] },
      { label: "Platform", nodes: ["Stripe Billing", "next-intl"] },
    ],
    links: { demo: "#" },
  },
];
