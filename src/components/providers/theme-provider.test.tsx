import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY, themeAccessibleName } from "@/lib/theme";
import { ThemeProvider, useTheme } from "./theme-provider";

function ThemeHarness() {
  const { mode, cycle } = useTheme();
  if (mode === null) return null;
  return (
    <button type="button" aria-label={themeAccessibleName(mode)} onClick={cycle}>
      cycle
    </button>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

async function flushImmediateTimers() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

async function advanceClock(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("ThemeProvider", () => {
  it("TC-07 switches auto from light to dark at 18:00 and keeps Theme: Auto", async () => {
    vi.setSystemTime(new Date(2026, 9, 16, 17, 59, 30));
    localStorage.setItem(THEME_STORAGE_KEY, "auto");

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );
    await flushImmediateTimers();

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: "Theme: Auto" })).toBeTruthy();

    await advanceClock(30_000);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Theme: Auto" })).toBeTruthy();
  });

  it("TC-07 switches auto from dark to light at 06:00 and keeps Theme: Auto", async () => {
    vi.setSystemTime(new Date(2026, 9, 16, 5, 59, 30));
    localStorage.setItem(THEME_STORAGE_KEY, "auto");

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );
    await flushImmediateTimers();

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Theme: Auto" })).toBeTruthy();

    await advanceClock(30_000);

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: "Theme: Auto" })).toBeTruthy();
  });

  it("TC-07 keeps stored light across 18:00", async () => {
    vi.setSystemTime(new Date(2026, 9, 16, 17, 59, 30));
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );
    await flushImmediateTimers();

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: "Theme: Light" })).toBeTruthy();

    await advanceClock(30_000);

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: "Theme: Light" })).toBeTruthy();
  });

  it("TC-13 keeps the applied theme when children are replaced", async () => {
    vi.setSystemTime(new Date(2026, 9, 16, 12, 0, 0));
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    const { rerender } = render(
      <ThemeProvider>
        <ThemeHarness />
        <p>first child</p>
      </ThemeProvider>,
    );
    await flushImmediateTimers();

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: "Theme: Light" })).toBeTruthy();
    expect(screen.getByText("first child")).toBeTruthy();

    rerender(
      <ThemeProvider>
        <ThemeHarness />
        <p>second child</p>
      </ThemeProvider>,
    );

    expect(screen.queryByText("first child")).toBeNull();
    expect(screen.getByText("second child")).toBeTruthy();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: "Theme: Light" })).toBeTruthy();
  });

  it("TC-15 keeps the cycled mode in memory when storage writes throw", async () => {
    vi.setSystemTime(new Date(2026, 9, 16, 12, 0, 0));
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    const { unmount } = render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );
    await flushImmediateTimers();

    expect(screen.getByRole("button", { name: "Theme: Auto" })).toBeTruthy();
    expect(document.documentElement.dataset.theme).toBe("light");

    fireEvent.click(screen.getByRole("button", { name: "Theme: Auto" }));

    expect(screen.getByRole("button", { name: "Theme: Light" })).toBeTruthy();
    expect(document.documentElement.dataset.theme).toBe("light");

    unmount();
    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );
    await flushImmediateTimers();

    expect(screen.getByRole("button", { name: "Theme: Auto" })).toBeTruthy();
  });
});
