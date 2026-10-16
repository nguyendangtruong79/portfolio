import { cn } from "@/lib/cn";

interface CoderLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CoderLogo({ className, size = "md" }: CoderLogoProps) {
  const sizeClasses = {
    sm: "size-6 text-[10px]",
    md: "size-7 text-xs",
    lg: "size-9 text-sm",
  }[size];

  return (
    <span
      className={cn(
        "group/logo relative inline-flex items-center justify-center rounded-lg border border-line bg-surface-2/90 font-mono font-bold tracking-tighter shadow-sm transition-all duration-300 hover:border-emerald/60 hover:shadow-[0_0_14px_rgba(16,185,129,0.25)]",
        sizeClasses,
        className
      )}
      aria-hidden
    >
      <span className="text-cyan transition-transform duration-200 group-hover/logo:-translate-x-0.5">
        &lt;
      </span>
      <span className="text-emerald font-black">/</span>
      <span className="text-cyan transition-transform duration-200 group-hover/logo:translate-x-0.5">
        &gt;
      </span>
      {/* Live status dot */}
      <span className="absolute -top-0.5 -right-0.5 flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-emerald" />
      </span>
    </span>
  );
}
