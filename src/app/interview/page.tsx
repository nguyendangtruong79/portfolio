"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isInterviewAuthenticated, clearInterviewAuthSession } from "@/lib/interview-auth";
import {
  ArrowLeft,
  ShieldCheck,
  Cpu,
  Users,
  Sparkles,
  Download,
  Mail,
  Phone,
  Check,
  Copy,
  Terminal,
  Layers,
  Zap,
  GitBranch,
  Lock,
} from "lucide-react";
import { profile } from "@/data/profile";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/brand-icons";
import { useToast } from "@/components/providers/toast-provider";
import { CoderLogo } from "@/components/ui/coder-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VsCodeQaWorkspace } from "@/components/interview/vscode-qa-workspace";

export default function InterviewDossierPage() {
  const router = useRouter();
  const { copy } = useToast();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    const authed = isInterviewAuthenticated();
    if (!authed) {
      setIsAuthorized(false);
      const timer = setTimeout(() => {
        router.replace("/?auth_required=true");
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const handleCopyEmail = () => {
    void copy(profile.email, "Email");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    void copy(profile.phone, "Phone");
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleLockSession = () => {
    clearInterviewAuthSession();
    router.replace("/");
  };

  // Prevent unauthorized render
  if (isAuthorized !== true) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-obsidian px-5 text-fg">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-surface text-rose-400 mb-5">
            <Lock className="size-6 animate-pulse" />
          </div>
          <p className="font-mono text-xs tracking-wider uppercase text-rose-400 font-semibold">
            [ACCESS DENIED // 401 UNAUTHORIZED]
          </p>
          <h2 className="mt-2 text-xl font-bold text-fg">
            Restricted Interview Dossier
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-fg-dim font-mono">
            Direct URL access is restricted. Please launch the terminal on the home page and run <span className="text-emerald">/interview</span> with the authorized security passcode.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/"
              className="btn btn-primary h-9 text-xs"
            >
              <ArrowLeft className="size-3.5" />
              Return to Terminal Gateway
            </Link>
          </div>
          <p className="mt-4 text-[11px] font-mono text-muted">
            Redirecting automatically...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-obsidian text-fg">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-xs text-fg-dim transition-colors hover:text-emerald"
          >
            <ArrowLeft className="size-4" />
            <span>Return to Portfolio</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="flex items-center gap-1.5 rounded-full border border-emerald/30 bg-surface px-3 py-1 font-mono text-[11px] font-medium text-emerald">
              <ShieldCheck className="size-3.5" />
              AUTHENTICATED // INTERVIEW DOSSIER
            </span>
            <button
              type="button"
              onClick={handleLockSession}
              className="btn btn-ghost h-8 px-2.5 font-mono text-[11px] text-muted hover:text-rose-400"
            >
              <Lock className="size-3 text-rose-400" />
              <span>Lock Session</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        {/* Executive Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/90 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 size-72 rounded-full bg-emerald/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2.5 font-mono text-xs text-emerald mb-2">
                <CoderLogo size="sm" />
                <span>TECH LEAD &amp; SENIOR FRONTEND BRIEFING</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
                {profile.name}
              </h1>
              <p className="mt-1 font-mono text-sm text-cyan">
                {profile.title} · {profile.yearsOfExperience} Years Experience
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg-dim sm:text-base">
                Architecting resilient multi-tenant SaaS runtimes, sub-frame virtualization engines, and high-velocity engineering squads. Proven track record turning chaotic enterprise codebases into fast, typed, test-automated systems with zero regression escapes.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2.5 shrink-0 sm:flex-row lg:flex-col">
              <a
                href={profile.resumeUrl}
                download
                className="btn btn-primary h-10 text-xs"
              >
                <Download className="size-3.5" />
                <span>Download Verified CV (DOCX)</span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="btn btn-ghost h-10 text-xs"
              >
                {copiedEmail ? <Check className="size-3.5 text-emerald" /> : <Mail className="size-3.5 text-cyan" />}
                <span>{profile.email}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="btn btn-ghost h-10 text-xs"
              >
                {copiedPhone ? <Check className="size-3.5 text-emerald" /> : <Phone className="size-3.5 text-emerald" />}
                <span>{profile.phone}</span>
              </button>
            </div>
          </div>

          {/* Key Indicators */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-4">
            <div>
              <p className="font-mono text-xs text-muted">Availability</p>
              <p className="font-medium text-emerald text-sm mt-1">Immediate / Flexible</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted">Target Roles</p>
              <p className="font-medium text-fg text-sm mt-1">Tech Lead / Senior / Staff</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted">Certifications</p>
              <p className="font-medium text-cyan text-sm mt-1">Claude Certified Architect</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted">Location &amp; Work Model</p>
              <p className="font-medium text-fg text-sm mt-1">Hanoi · Remote Friendly</p>
            </div>
          </div>
        </div>

        {/* Architectural Q&A Section with VS Code IDE Experience */}
        <section className="mt-16">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-emerald" />
            <h2 className="eyebrow">Architectural &amp; Technical Deep-Dives</h2>
          </div>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            Frequently Asked Interview Questions &amp; Technical Trade-offs
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-fg-dim">
            Interactive VS Code explorer: Click any tech stack folder to browse questions graded from Easy to Hard. Inspect full STAR model analyses with quantified metrics and production code/mindmap artifacts.
          </p>

          <div className="mt-8">
            <VsCodeQaWorkspace />
          </div>
        </section>

        {/* Action Callout */}
        <div className="mt-16 rounded-2xl border border-line bg-surface-2/60 p-8 text-center sm:p-12">
          <h3 className="text-2xl font-bold tracking-tight text-fg">
            Ready to proceed with a technical discussion?
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-fg-dim">
            Feel free to book a direct conversation, technical interview, or code review session.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${profile.email}?subject=Interview%20Invitation%20-%20Nguyen%20Dang%20Truong`}
              className="btn btn-primary"
            >
              <Mail className="size-4" />
              <span>Send Direct Invitation</span>
            </a>
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              <LinkedInIcon className="size-4" />
              <span>Connect on LinkedIn</span>
            </a>
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              <GitHubIcon className="size-4" />
              <span>View GitHub Repos</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
