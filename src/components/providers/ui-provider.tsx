"use client";

import { useLenis } from "lenis/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

interface UIState {
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean | ((o: boolean) => boolean)) => void;
  terminalOpen: boolean;
  setTerminalOpen: (open: boolean | ((o: boolean) => boolean)) => void;
  activeProjectId: string | null;
  openProject: (id: string) => void;
  closeProject: () => void;
  scrollTo: (id: string) => void;
}

const UIContext = createContext<UIState | null>(null);

export function UIProvider({ children }: PropsWithChildren) {
  const lenis = useLenis();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const anyOverlay = paletteOpen || terminalOpen || activeProjectId !== null;

  // Freeze background scroll while an overlay is open
  useEffect(() => {
    if (lenis) {
      if (anyOverlay) lenis.stop();
      else lenis.start();
    } else {
      document.documentElement.style.overflow = anyOverlay ? "hidden" : "";
    }
  }, [anyOverlay, lenis]);

  // Global shortcuts: ⌘K / Ctrl+K → palette, Ctrl+` → terminal drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setTerminalOpen(false);
        setPaletteOpen((o) => !o);
      } else if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setPaletteOpen(false);
        setTerminalOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scrollTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      const focusTarget = () => {
        if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
      };
      if (lenis) {
        lenis.start();
        lenis.scrollTo(el, { offset: -72, duration: 1.2, onComplete: focusTarget });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        focusTarget();
      }
      history.replaceState(null, "", `#${id}`);
    },
    [lenis],
  );

  const value = useMemo<UIState>(
    () => ({
      paletteOpen,
      setPaletteOpen,
      terminalOpen,
      setTerminalOpen,
      activeProjectId,
      openProject: (id) => setActiveProjectId(id),
      closeProject: () => setActiveProjectId(null),
      scrollTo,
    }),
    [paletteOpen, terminalOpen, activeProjectId, scrollTo],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within <UIProvider>");
  return ctx;
}
