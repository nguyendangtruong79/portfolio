"use client";

import { Clock, Moon, Sun, type LucideIcon } from "lucide-react";
import { themeAccessibleName, type ThemeMode } from "@/lib/theme";
import { useTheme } from "@/components/providers/theme-provider";

const modeIcons: Record<ThemeMode, LucideIcon> = {
  light: Sun,
  dark: Moon,
  auto: Clock,
};

export function ThemeToggle() {
  const { mode, cycle } = useTheme();
  if (mode === null) return null;

  const Icon = modeIcons[mode];

  return (
    <button
      type="button"
      aria-label={themeAccessibleName(mode)}
      onClick={cycle}
      className="grid size-9 place-items-center rounded-lg text-fg-dim hover:bg-surface-2 hover:text-emerald"
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
