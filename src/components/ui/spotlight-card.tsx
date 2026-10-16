"use client";

import { useCallback, useRef, type ComponentPropsWithoutRef, type ElementType } from "react";
import { cn } from "@/lib/cn";
import type { Accent } from "@/data/projects";

type SpotlightCardProps<T extends ElementType> = {
  as?: T;
  accent?: Accent;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Card with a cursor-following radial gradient border.
 * Pointer position is written straight to CSS custom properties (no React
 * re-render), batched per animation frame.
 */
export function SpotlightCard<T extends ElementType = "div">({
  as,
  accent = "emerald",
  className,
  children,
  ...rest
}: SpotlightCardProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const frame = useRef(0);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${clientX - r.left}px`);
      el.style.setProperty("--my", `${clientY - r.top}px`);
    });
  }, []);

  return (
    <Tag
      ref={ref}
      data-accent={accent}
      onPointerMove={onPointerMove}
      className={cn("spotlight", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
