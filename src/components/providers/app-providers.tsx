"use client";

import { MotionConfig, useReducedMotion } from "framer-motion";
import { ReactLenis } from "lenis/react";
import type { PropsWithChildren } from "react";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { UIProvider } from "./ui-provider";

export function AppProviders({ children }: PropsWithChildren) {
  // Respect prefers-reduced-motion: native wheel scrolling, no momentum.
  const reduce = useReducedMotion() ?? false;

  return (
    <ThemeProvider>
      <ReactLenis root options={{ lerp: 0.1, smoothWheel: !reduce, anchors: false }}>
        <MotionConfig reducedMotion="user" transition={{ ease: [0.16, 1, 0.3, 1] }}>
          <ToastProvider>
            <UIProvider>{children}</UIProvider>
          </ToastProvider>
        </MotionConfig>
      </ReactLenis>
    </ThemeProvider>
  );
}
