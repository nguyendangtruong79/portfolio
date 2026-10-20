import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/data/profile";
import { themeBootScript } from "@/lib/theme";
import { AppProviders } from "@/components/providers/app-providers";
import { DotGrid } from "@/components/ui/dot-grid";
import { Navbar } from "@/components/layout/navbar";
import { CommandPalette } from "@/components/command-palette";
import { TerminalDrawer } from "@/components/terminal/terminal-drawer";
import { ProjectModal } from "@/components/work/project-modal";
import { AuthRedirectNotifier } from "@/components/ui/auth-redirect-notifier";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.title}`,
  description: `${profile.title}. Engineering resilient, high-concurrency frontend architectures, multi-tenant state isolation, and high-velocity engineering cultures.`,
  keywords: [
    "Senior Software Engineer",
    "Frontend Lead",
    "Staff Frontend Engineer",
    "Next.js App Router",
    "TypeScript",
    "Architecture",
    "TanStack Query",
    "Performance Optimization",
  ],
  authors: [{ name: profile.name, url: profile.siteUrl }],
  creator: profile.name,
  metadataBase: new URL(profile.siteUrl),
  openGraph: {
    title: `${profile.name} — ${profile.title}`,
    description:
      "Engineering resilient front-end architectures. Leading teams from chaos to velocity.",
    type: "website",
    locale: "en_US",
    url: profile.siteUrl,
    siteName: `${profile.name} Portfolio`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.title}`,
    description:
      "Engineering resilient front-end architectures. Leading teams from chaos to velocity.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="relative min-h-full flex flex-col bg-obsidian text-fg">
        <script dangerouslySetInnerHTML={{ __html: themeBootScript() }} />
        <AppProviders>
          <DotGrid />
          <Navbar />
          <div className="flex-1">{children}</div>
          <CommandPalette />
          <TerminalDrawer />
          <ProjectModal />
          <AuthRedirectNotifier />
        </AppProviders>
      </body>
    </html>
  );
}
