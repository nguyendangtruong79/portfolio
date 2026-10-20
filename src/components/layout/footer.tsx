"use client";

import { Mail, Copy, Check, KeyRound, ArrowUpRight, Terminal } from "lucide-react";
import { useState } from "react";
import { profile } from "@/data/profile";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/brand-icons";
import { useToast } from "@/components/providers/toast-provider";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export function Footer() {
  const { copy } = useToast();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPgp, setCopiedPgp] = useState(false);

  const handleCopyEmail = () => {
    void copy(profile.email, "Email address");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPgp = () => {
    void copy(profile.pgpFingerprint, "PGP Fingerprint");
    setCopiedPgp(true);
    setTimeout(() => setCopiedPgp(false), 2000);
  };

  return (
    <footer id="contact" aria-labelledby="footer-heading" className="border-t border-line bg-surface/40 pt-20 pb-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Main callout */}
          <div className="lg:col-span-7">
            <p className="eyebrow">Direct Connect</p>
            <h2 id="footer-heading" className="mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
              Ready to ship resilient architecture? Let&apos;s build together.
            </h2>
            <p className="mt-3 max-w-lg text-base text-fg-dim">
              Open for Senior Software Engineer, Frontend Lead, and Staff UI Engineering roles. Reach out directly for technical architecture discussions or team leadership opportunities.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="btn btn-primary"
              >
                {copiedEmail ? <Check className="size-4" /> : <Mail className="size-4" />}
                <span>{profile.email}</span>
                <span className="font-mono text-xs">(1-click copy)</span>
              </button>

              <a
                href={`tel:${profile.phone.replace(/[^0-9+]/g, "")}`}
                className="btn btn-ghost"
              >
                <span>{profile.phone}</span>
              </a>

              <a
                href={profile.socials.github}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                <GitHubIcon className="size-4" />
                <span>GitHub</span>
                <ArrowUpRight className="size-3 text-muted" />
              </a>

              <a
                href={profile.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                <LinkedInIcon className="size-4" />
                <span>LinkedIn</span>
                <ArrowUpRight className="size-3 text-muted" />
              </a>
            </div>
          </div>

          {/* Terminal / PGP Card */}
          <div className="lg:col-span-5">
            <SpotlightCard className="p-5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="flex items-center gap-2 text-emerald">
                  <KeyRound className="size-3.5" />
                  <span>PGP FINGERPRINT</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyPgp}
                  className="flex items-center gap-1 text-muted hover:text-fg transition-colors"
                >
                  {copiedPgp ? <Check className="size-3 text-emerald" /> : <Copy className="size-3" />}
                  <span>{copiedPgp ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <p className="mt-3 break-all text-fg-dim leading-relaxed">
                {profile.pgpFingerprint}
              </p>

              <div className="mt-6 border-t border-line/60 pt-4 text-[11px] text-muted space-y-1">
                <p className="flex items-center gap-1.5 text-cyan">
                  <Terminal className="size-3 text-cyan" />
                  <span>Claude Certified Architect (2025)</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Terminal className="size-3 text-emerald" />
                  <span>Verified commit sign-off via Ed25519</span>
                </p>
                <p>Status: All systems operational. 0 known vulnerabilities.</p>
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* Bottom sign-off */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row font-mono text-xs text-muted">
          <p>© 2026 {profile.name}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Built with Next.js App Router</span>
            <span>·</span>
            <span>Tailwind v4</span>
            <span>·</span>
            <span>Framer Motion</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
