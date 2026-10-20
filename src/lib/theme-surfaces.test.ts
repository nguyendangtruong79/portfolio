import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const TERMINAL_DRAWER = "src/components/terminal/terminal-drawer.tsx";
const HERO_TERMINAL = "src/components/hero/hero-terminal.tsx";
const DIFF_VIEWER = "src/components/code/diff-viewer.tsx";
const DOT_GRID = "src/components/ui/dot-grid.tsx";

const SURFACE_FILES = [TERMINAL_DRAWER, HERO_TERMINAL, DIFF_VIEWER, DOT_GRID] as const;

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("hardcoded dark surfaces", () => {
  it("TC-12 retokens panel backgrounds and the dot-grid vignette", () => {
    const sources = new Map(SURFACE_FILES.map((path) => [path, readSource(path)]));

    for (const path of SURFACE_FILES) {
      expect(sources.get(path), path).not.toContain("bg-[#07080c]");
    }

    expect(sources.get(TERMINAL_DRAWER)).toContain("bg-obsidian");
    expect(sources.get(HERO_TERMINAL)).toContain("bg-obsidian");
    expect(sources.get(DIFF_VIEWER)).toContain("bg-obsidian");

    const vignette = sources.get(DOT_GRID);
    expect(vignette).toContain("var(--palette-obsidian)");
    expect(vignette).not.toContain("#090a0f");
  });
});
