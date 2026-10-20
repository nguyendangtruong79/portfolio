import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";
import {
  cycleThemeMode,
  msUntilNextThemeCheck,
  parseThemeMode,
  readStoredThemeMode,
  resolveAppearance,
  themeAccessibleName,
  themeBootScript,
  writeStoredThemeMode,
} from "./theme";

const day = 16;
const month = 9;
const year = 2026;

function at(hours: number, minutes: number, seconds = 0): Date {
  return new Date(year, month, day, hours, minutes, seconds);
}

function memoryStorage() {
  const items = new Map<string, string>();
  return {
    getItem(key: string) {
      return items.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      items.set(key, value);
    },
  };
}

describe("theme mode, clock, and storage", () => {
  it("TC-01 resolves auto at local noon to light and names it Theme: Auto", () => {
    const noon = at(12, 0, 0);

    expect(resolveAppearance("auto", noon)).toBe("light");
    expect(themeAccessibleName("auto")).toBe("Theme: Auto");
  });

  it("TC-02 resolves auto at local 21:00 to dark and names it Theme: Auto", () => {
    const night = at(21, 0, 0);

    expect(resolveAppearance("auto", night)).toBe("dark");
    expect(themeAccessibleName("auto")).toBe("Theme: Auto");
  });

  it("TC-03 cycles auto three times at 21:00 through light, dark, and auto", () => {
    const night = at(21, 0, 0);

    const light = cycleThemeMode("auto");
    expect(light).toBe("light");
    expect(resolveAppearance(light, night)).toBe("light");
    expect(themeAccessibleName(light)).toBe("Theme: Light");

    const dark = cycleThemeMode(light);
    expect(dark).toBe("dark");
    expect(resolveAppearance(dark, night)).toBe("dark");
    expect(themeAccessibleName(dark)).toBe("Theme: Dark");

    const auto = cycleThemeMode(dark);
    expect(auto).toBe("auto");
    expect(resolveAppearance(auto, night)).toBe("dark");
    expect(themeAccessibleName(auto)).toBe("Theme: Auto");
  });

  it("TC-04 resolves auto at 05:59, 06:00, 17:59, and 18:00", () => {
    const cases: Array<[Date, "light" | "dark"]> = [
      [at(5, 59), "dark"],
      [at(6, 0), "light"],
      [at(17, 59), "light"],
      [at(18, 0), "dark"],
    ];

    for (const [when, appearance] of cases) {
      expect(resolveAppearance("auto", when)).toBe(appearance);
      expect(themeAccessibleName("auto")).toBe("Theme: Auto");
    }
  });

  it("TC-05 resolves auto at 05:59:59, 06:00:00, 17:59:59, and 18:00:00", () => {
    expect(resolveAppearance("auto", at(5, 59, 59))).toBe("dark");
    expect(resolveAppearance("auto", at(6, 0, 0))).toBe("light");
    expect(resolveAppearance("auto", at(17, 59, 59))).toBe("light");
    expect(resolveAppearance("auto", at(18, 0, 0))).toBe("dark");
  });

  it("TC-06 reports 30000 ms near the boundaries and 60000 ms at noon", () => {
    expect(msUntilNextThemeCheck(at(17, 59, 30))).toBe(30000);
    expect(msUntilNextThemeCheck(at(5, 59, 30))).toBe(30000);
    expect(msUntilNextThemeCheck(at(12, 0, 0))).toBe(60000);
  });

  it("TC-08 stores the mode and resolves appearance from that stored mode", () => {
    const storage = memoryStorage();
    const night = at(21, 0, 0);
    const noon = at(12, 0, 0);

    expect(writeStoredThemeMode(storage, "light")).toBe(true);
    expect(storage.getItem("portfolio-theme")).toBe("light");
    const light = readStoredThemeMode(storage);
    expect(light).toBe("light");
    expect(resolveAppearance(light, night)).toBe("light");
    expect(themeAccessibleName(light)).toBe("Theme: Light");

    expect(writeStoredThemeMode(storage, "dark")).toBe(true);
    expect(storage.getItem("portfolio-theme")).toBe("dark");
    const dark = readStoredThemeMode(storage);
    expect(dark).toBe("dark");
    expect(resolveAppearance(dark, noon)).toBe("dark");
    expect(themeAccessibleName(dark)).toBe("Theme: Dark");

    expect(writeStoredThemeMode(storage, "auto")).toBe(true);
    expect(storage.getItem("portfolio-theme")).toBe("auto");
    const auto = readStoredThemeMode(storage);
    expect(auto).toBe("auto");
    expect(resolveAppearance(auto, night)).toBe("dark");
    expect(themeAccessibleName(auto)).toBe("Theme: Auto");
  });

  it("TC-14 treats blue and throwing storage as auto, then cycles to light", () => {
    expect(parseThemeMode(null)).toBe("auto");
    expect(parseThemeMode("blue")).toBe("auto");

    const blueStorage = {
      getItem: () => "blue",
      setItem: () => {},
    };
    expect(readStoredThemeMode(blueStorage)).toBe("auto");

    const throwingStorage = {
      getItem: () => {
        throw new Error("storage read blocked");
      },
      setItem: () => {
        throw new Error("storage write blocked");
      },
    };
    expect(readStoredThemeMode(throwingStorage)).toBe("auto");
    expect(writeStoredThemeMode(throwingStorage, "light")).toBe(false);

    expect(resolveAppearance("auto", at(12, 0, 0))).toBe("light");
    expect(cycleThemeMode("auto")).toBe("light");
  });

  it("TC-18 writes only the mode enum under portfolio-theme", () => {
    const modes = ["light", "dark", "auto"] as const;

    for (const mode of modes) {
      const writes: Array<[string, string]> = [];
      const storage = {
        getItem: () => null,
        setItem: (key: string, value: string) => {
          writes.push([key, value]);
        },
      };

      writeStoredThemeMode(storage, mode);

      expect(writes).toEqual([["portfolio-theme", mode]]);
    }
  });

  it("TC-17 sets data-theme to light from stored light at 21:00", () => {
    vi.setSystemTime(new Date(2026, 9, 16, 21, 0, 0));
    try {
      const documentElement = {
        dataset: {} as { theme?: string },
        getAttribute(name: string) {
          return name === "data-theme" ? (this.dataset.theme ?? null) : null;
        },
        setAttribute(name: string, value: string) {
          if (name === "data-theme") {
            this.dataset.theme = value;
          }
        },
      };

      const source = themeBootScript();
      expect(typeof source).toBe("string");
      expect(source).not.toMatch(/\bimport\b/);
      expect(source).not.toMatch(/\brequire\s*\(/);

      runInNewContext(source, {
        Date,
        document: { documentElement },
        localStorage: {
          getItem(key: string) {
            return key === "portfolio-theme" ? "light" : null;
          },
        },
      });

      const applied =
        documentElement.getAttribute("data-theme") ??
        documentElement.dataset.theme;

      expect(applied).toBe("light");
    } finally {
      vi.useRealTimers();
    }
  });
});
