import { Hero } from "@/components/hero/hero";
import { DualCoreImpact } from "@/components/impact/dual-core-impact";
import { MetricsDashboard } from "@/components/metrics/metrics-dashboard";
import { FeaturedWork } from "@/components/work/featured-work";
import { DiffViewer } from "@/components/code/diff-viewer";
import { CliPlayground } from "@/components/terminal/cli-playground";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <main className="relative flex flex-col">
      <Hero />
      <DualCoreImpact />
      <MetricsDashboard />
      <FeaturedWork />
      <DiffViewer />
      <CliPlayground />
      <Footer />
    </main>
  );
}
