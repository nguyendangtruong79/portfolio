export type ThemeMode = "light" | "dark" | "auto";
export type ThemeAppearance = "light" | "dark";

export const THEME_STORAGE_KEY = "portfolio-theme";

const LIGHT_START_MINUTES = 6 * 60;
const DARK_START_MINUTES = 18 * 60;
const CHECK_CAP_MS = 60000;
const DAY_MS = 24 * 60 * 60 * 1000;

const ACCESSIBLE_NAMES: Record<ThemeMode, string> = {
  light: "Theme: Light",
  dark: "Theme: Dark",
  auto: "Theme: Auto",
};

export interface ThemeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function parseThemeMode(raw: string | null): ThemeMode {
  if (raw === "light" || raw === "dark" || raw === "auto") {
    return raw;
  }
  return "auto";
}

export function resolveAppearance(
  mode: ThemeMode,
  at: Date,
): ThemeAppearance {
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";

  const minutes = at.getHours() * 60 + at.getMinutes();
  if (minutes >= LIGHT_START_MINUTES && minutes < DARK_START_MINUTES) {
    return "light";
  }
  return "dark";
}

export function cycleThemeMode(mode: ThemeMode): ThemeMode {
  if (mode === "light") return "dark";
  if (mode === "dark") return "auto";
  return "light";
}

export function themeAccessibleName(mode: ThemeMode): string {
  return ACCESSIBLE_NAMES[mode];
}

export function msUntilNextThemeCheck(at: Date): number {
  const elapsedMs =
    ((at.getHours() * 60 + at.getMinutes()) * 60 + at.getSeconds()) * 1000 +
    at.getMilliseconds();
  const lightStartMs = LIGHT_START_MINUTES * 60 * 1000;
  const darkStartMs = DARK_START_MINUTES * 60 * 1000;

  let untilNextBoundaryMs: number;
  if (elapsedMs < lightStartMs) {
    untilNextBoundaryMs = lightStartMs - elapsedMs;
  } else if (elapsedMs < darkStartMs) {
    untilNextBoundaryMs = darkStartMs - elapsedMs;
  } else {
    untilNextBoundaryMs = DAY_MS - elapsedMs + lightStartMs;
  }

  return Math.min(untilNextBoundaryMs, CHECK_CAP_MS);
}

export function readStoredThemeMode(storage: ThemeStorage): ThemeMode {
  try {
    return parseThemeMode(storage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "auto";
  }
}

export function writeStoredThemeMode(
  storage: ThemeStorage,
  mode: ThemeMode,
): boolean {
  try {
    storage.setItem(THEME_STORAGE_KEY, mode);
    return true;
  } catch {
    return false;
  }
}

export function themeBootScript(): string {
  return `(function () {
    var mode = "auto";
    try {
      var stored = localStorage.getItem("portfolio-theme");
      if (stored === "light" || stored === "dark" || stored === "auto") {
        mode = stored;
      }
    } catch {
      mode = "auto";
    }

    var appearance = mode;
    if (mode === "auto") {
      var now = new Date();
      var minutes = now.getHours() * 60 + now.getMinutes();
      appearance = minutes >= 6 * 60 && minutes < 18 * 60 ? "light" : "dark";
    }

    var root = document.documentElement;
    root.setAttribute("data-theme", appearance);
    if (root.dataset) {
      root.dataset.theme = appearance;
    }
  })();`;
}
