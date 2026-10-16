"use client";

import { useEffect, useRef } from "react";

const GAP = 28;
const RADIUS = 180;

/**
 * Fixed full-viewport interactive dot grid.
 * - Dots near the cursor brighten / swell with an eased trailing focus point.
 * - rAF loop only runs while the focus point is still converging → idle = 0 CPU.
 * - DPR-aware, resize-aware, paused when the tab is hidden.
 */
export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    const target = { x: -9999, y: -9999 };
    const pos = { x: -9999, y: -9999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const r2 = RADIUS * RADIUS;
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          const dx = x - pos.x;
          const dy = y - pos.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2) {
            const t = 1 - Math.sqrt(d2) / RADIUS;
            const e = t * t;
            ctx.fillStyle = `rgba(16,185,129,${0.12 + e * 0.75})`;
            ctx.beginPath();
            ctx.arc(x, y, 0.9 + e * 1.4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = "rgba(100,116,139,0.16)";
            ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
          }
        }
      }
    };

    const tick = () => {
      const k = reduce ? 1 : 0.14;
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      draw();
      if (Math.abs(target.x - pos.x) > 0.3 || Math.abs(target.y - pos.y) > 0.3) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const kick = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (pos.x < -9000) {
        pos.x = e.clientX;
        pos.y = e.clientY;
      }
      target.x = e.clientX;
      target.y = e.clientY;
      kick();
    };
    const onLeave = () => {
      target.x = pos.x = -9999;
      target.y = pos.y = -9999;
      draw();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <canvas ref={canvasRef} className="size-full" />
      {/* vignette + ambient glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_30%,#090a0f_85%)]" />
      <div className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-emerald/10 blur-[120px]" />
      <div className="absolute top-[40%] -right-40 h-[420px] w-[520px] rounded-full bg-cyan/[0.06] blur-[120px]" />
    </div>
  );
}
