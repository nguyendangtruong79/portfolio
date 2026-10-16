import { cn } from "@/lib/cn";
import type { Accent, DiagramLayer } from "@/data/projects";

interface ArchitectureDiagramProps {
  layers: DiagramLayer[];
  accent?: Accent;
  compact?: boolean;
  className?: string;
}

/**
 * Data-driven architecture flow: layers → nodes, joined by connectors with a
 * travelling packet (transform-only animation → compositor thread).
 */
export function ArchitectureDiagram({ layers, accent = "emerald", compact, className }: ArchitectureDiagramProps) {
  const color = accent === "cyan" ? "bg-cyan" : "bg-emerald";
  const text = accent === "cyan" ? "text-cyan" : "text-emerald";

  return (
    <figure
      className={cn("flex w-full items-stretch", compact ? "gap-1.5" : "flex-col gap-2 sm:flex-row sm:gap-0", className)}
      aria-label={`Architecture flow: ${layers.map((l) => `${l.label} (${l.nodes.join(", ")})`).join(" → ")}`}
    >
      {layers.map((layer, i) => (
        <div key={layer.label} className={cn("flex min-w-0 flex-1 items-stretch", !compact && "flex-col sm:flex-row")}>
          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col rounded-xl border border-line bg-obsidian/60",
              compact ? "gap-1 p-2" : "gap-1.5 p-3",
            )}
          >
            <span className={cn("font-mono tracking-[0.14em] uppercase", text, compact ? "text-[9px]" : "text-[10px]")}>
              {layer.label}
            </span>
            {layer.nodes.map((n) => (
              <span
                key={n}
                className={cn(
                  "truncate rounded-md border border-line/80 bg-surface-2 font-mono text-fg-dim",
                  compact ? "px-1.5 py-1 text-[9.5px]" : "px-2 py-1.5 text-[11px]",
                )}
              >
                {n}
              </span>
            ))}
          </div>
          {i < layers.length - 1 && (
            <div
              aria-hidden
              className={cn(
                "relative shrink-0 self-center overflow-hidden",
                compact ? "h-px w-3" : "h-5 w-px self-center sm:h-px sm:w-6",
              )}
            >
              <span className="absolute inset-0 bg-line" />
              <span className={cn("absolute inset-y-0 left-0 w-1/3 animate-flow opacity-80", color)} />
            </div>
          )}
        </div>
      ))}
    </figure>
  );
}
