import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

const DARK_SELECTOR = ':root, [data-theme="dark"]';
const LIGHT_SELECTOR = '[data-theme="light"]';
const LIGHT_BUTTON_SELECTOR = '[data-theme="light"] .btn-primary';

const DARK_TOKENS = {
  "--palette-obsidian": "#090a0f",
  "--palette-surface": "#12131a",
  "--palette-surface-2": "#181924",
  "--palette-line": "#27273a",
  "--palette-line-strong": "#34344d",
  "--palette-emerald": "#10b981",
  "--palette-cyan": "#06b6d4",
  "--palette-muted": "#64748b",
  "--palette-fg": "#e6e8ef",
  "--palette-fg-dim": "#a1a7b8",
} as const;

function extractBlock(source: string, selector: string): string {
  let from = 0;
  while (from < source.length) {
    const index = source.indexOf(selector, from);
    if (index === -1) {
      throw new Error(`Missing selector ${selector}`);
    }
    const afterSelector = source.slice(index + selector.length);
    const openMatch = /^\s*\{/.exec(afterSelector);
    if (!openMatch) {
      from = index + selector.length;
      continue;
    }
    const openIndex = index + selector.length + openMatch[0].length - 1;
    return balancedBlock(source, openIndex);
  }
  throw new Error(`Missing selector ${selector}`);
}

function balancedBlock(source: string, openIndex: number): string {
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex + 1, index);
    }
  }
  throw new Error(`Unclosed block at ${openIndex}`);
}

function declarations(block: string): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (const part of block.split(";")) {
    const colon = part.indexOf(":");
    if (colon === -1) continue;
    const name = part.slice(0, colon).trim();
    const value = part.slice(colon + 1).trim();
    if (/^[\w-]+$/.test(name)) parsed[name] = value;
  }
  return parsed;
}

function srgbChannel(value: number): number {
  const channel = value / 255;
  return channel <= 0.03928
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) throw new Error(`Expected a 6-digit hex color, received ${hex}`);
  const digits = match[1];
  const red = Number.parseInt(digits.slice(0, 2), 16);
  const green = Number.parseInt(digits.slice(2, 4), 16);
  const blue = Number.parseInt(digits.slice(4, 6), 16);
  return (
    0.2126 * srgbChannel(red) +
    0.7152 * srgbChannel(green) +
    0.0722 * srgbChannel(blue)
  );
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  return (lighter + 0.05) / (darker + 0.05);
}

describe("theme palette contrast", () => {
  it('TC-11: [data-theme="light"] sets obsidian and surface', () => {
    const light = declarations(extractBlock(css, LIGHT_SELECTOR));

    expect(light["--palette-obsidian"]).toBe("#f4f6f8");
    expect(light["--palette-surface"]).toBe("#ffffff");
    expect(light["--palette-surface"]).not.toBe("#12131a");
  });

  it("TC-16: dark and light palettes meet WCAG contrast", () => {
    const dark = declarations(extractBlock(css, DARK_SELECTOR));
    const light = declarations(extractBlock(css, LIGHT_SELECTOR));
    const lightButton = declarations(extractBlock(css, LIGHT_BUTTON_SELECTOR));

    expect(dark).toMatchObject(DARK_TOKENS);

    const page = light["--palette-obsidian"];
    const surface = light["--palette-surface"];
    const text = light["--palette-fg"];
    const emerald = light["--palette-emerald"];
    const cyan = light["--palette-cyan"];
    const muted = light["--palette-muted"];
    const fgDim = light["--palette-fg-dim"];
    const line = light["--palette-line"];
    const amber300 = light["--color-amber-300"];
    const amber400 = light["--color-amber-400"];
    const rose300 = light["--color-rose-300"];
    const rose400 = light["--color-rose-400"];
    const buttonText = lightButton.color;

    expect(page).toBe("#f4f6f8");
    expect(surface).toBe("#ffffff");
    expect(text).toBe("#12141a");
    expect(emerald).toBe("#047857");
    expect(cyan).toBe("#0e7490");
    expect(muted).toBe("#4b5568");
    expect(fgDim).toBe("#3e4654");
    expect(line).toBe("#7d8694");
    expect(amber300).toBe("#92400e");
    expect(amber400).toBe("#92400e");
    expect(rose300).toBe("#be123c");
    expect(rose400).toBe("#be123c");
    expect(buttonText).toBe("#ffffff");

    const backgrounds = [page, surface];
    expect(contrastRatio(text, page)).toBeGreaterThanOrEqual(4.5);
    for (const foreground of [emerald, cyan, muted, fgDim, amber300, rose300]) {
      for (const background of backgrounds) {
        expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
      }
    }
    for (const background of ["#e7ebf0", "#ebedef", "#e9edf1"]) {
      expect(contrastRatio(amber300, background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(amber400, background)).toBeGreaterThanOrEqual(4.5);
    }
    for (const background of backgrounds) {
      expect(contrastRatio(line, background)).toBeGreaterThanOrEqual(3);
    }
    expect(contrastRatio(buttonText, emerald)).toBeGreaterThanOrEqual(4.5);

    for (const foreground of [
      light["--color-emerald-300"],
      light["--color-emerald-400"],
      light["--color-violet-400"],
    ]) {
      for (const background of backgrounds) {
        expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
      }
    }

    const selection = declarations(
      extractBlock(css, '[data-theme="light"] ::selection'),
    );
    expect(selection.color).toBe("#12141a");
  });

  it("TC-16: light theme does not use translucent text or tinted text fills", () => {
    const files = [
      "src/components/code/diff-viewer.tsx",
      "src/components/interview/vscode-qa-workspace.tsx",
      "src/components/terminal/terminal.tsx",
      "src/components/hero/hero.tsx",
      "src/app/interview/page.tsx",
      "src/components/layout/footer.tsx",
    ].map((file) => readFileSync(resolve(process.cwd(), file), "utf8"));
    const source = files.join("\n");

    for (const utility of [
      "text-emerald-300",
      "text-muted/40",
      "text-muted/50",
      "text-muted/60",
      "text-muted/70",
      "text-muted/80",
      "text-cyan/90",
      "text-emerald/70",
      "text-violet-400/60",
      "bg-emerald/20 text-emerald",
      "bg-emerald-500/20 text-emerald-300",
      "bg-cyan/20 text-cyan",
      "bg-rose-500/20 text-rose-300",
      "bg-rose-500/10 text-rose-300",
      "bg-rose-500/10 text-rose-400",
      "bg-emerald/15 text-emerald",
      "bg-emerald/10 text-emerald",
      "bg-emerald-500/10 text-emerald-400",
      "bg-amber-500/10 text-amber-400",
      "bg-amber-500/10",
      "bg-amber-400/20 text-amber-300",
      "bg-cyan/10 text-cyan",
      "bg-violet-500/10 text-violet-400",
      "bg-emerald/[0.07]",
      "focus:border-emerald/50",
      "border-amber-400/40",
      "border-line/40",
      "border border-emerald/40",
      "border border-emerald/30 font-medium",
      "shadow-sm border border-emerald/30",
      "shadow-sm border border-cyan/30",
      "border-emerald/40 bg-surface",
      "border border-emerald/50",
      "border border-cyan/30",
      "hover:border-emerald/50",
      "opacity-75",
      "text-muted animate-pulse",
    ]) {
      expect(source).not.toContain(utility);
    }

    expect(css).not.toContain("color-mix(in oklab, var(--color-emerald) 70%, white)");
    const hover = declarations(
      extractBlock(css, '[data-theme="light"] .btn-primary:hover'),
    );
    expect(hover.background).toBe("#047857");
    expect(contrastRatio("#ffffff", hover.background)).toBeGreaterThanOrEqual(4.5);
  });
});
