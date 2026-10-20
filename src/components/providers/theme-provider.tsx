"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  cycleThemeMode,
  msUntilNextThemeCheck,
  readStoredThemeMode,
  resolveAppearance,
  writeStoredThemeMode,
  type ThemeMode,
} from "@/lib/theme";

interface ThemeState {
  mode: ThemeMode | null;
  cycle: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode | null>(null);

  useEffect(() => {
    const stored = readStoredThemeMode(localStorage);
    // Deferred so this effect can read storage without a synchronous setState.
    const timeoutId = window.setTimeout(() => {
      setMode(stored);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (mode === null) return;

    const apply = () => {
      document.documentElement.dataset.theme = resolveAppearance(mode, new Date());
    };

    apply();

    if (mode !== "auto") return;

    let timeoutId = 0;
    const tick = () => {
      apply();
      timeoutId = window.setTimeout(tick, msUntilNextThemeCheck(new Date()));
    };
    timeoutId = window.setTimeout(tick, msUntilNextThemeCheck(new Date()));

    return () => window.clearTimeout(timeoutId);
  }, [mode]);

  const cycle = useCallback(() => {
    if (mode === null) return;
    const next = cycleThemeMode(mode);
    writeStoredThemeMode(localStorage, next);
    setMode(next);
  }, [mode]);

  const value = useMemo<ThemeState>(() => ({ mode, cycle }), [mode, cycle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
