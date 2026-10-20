import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { UIProvider } from "@/components/providers/ui-provider";
import { Navbar } from "./navbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("lenis/react", () => ({
  useLenis: () => null,
}));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

function ancestors(element: HTMLElement): HTMLElement[] {
  const nodes: HTMLElement[] = [];
  let current = element.parentElement;
  while (current) {
    nodes.push(current);
    current = current.parentElement;
  }
  return nodes;
}

describe("Navbar", () => {
  it("TC-10 shows one Theme: Auto button in the visible navbar action cluster", async () => {
    render(
      <ThemeProvider>
        <UIProvider>
          <Navbar />
        </UIProvider>
      </ThemeProvider>,
    );

    const button = await screen.findByRole("button", { name: "Theme: Auto" });
    expect(screen.getAllByRole("button", { name: "Theme: Auto" })).toHaveLength(1);

    const nav = button.closest("nav");
    expect(nav).not.toBeNull();

    const cluster = Array.from(nav!.children).find(
      (child) => child.tagName === "DIV" && child.contains(button),
    );
    expect(cluster).toBeInstanceOf(HTMLElement);
    expect((cluster as HTMLElement).classList.contains("hidden")).toBe(false);

    for (const ancestor of ancestors(button)) {
      expect(ancestor.classList.contains("hidden")).toBe(false);
    }
  });
});
