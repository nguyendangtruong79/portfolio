import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { ThemeToggle } from "./theme-toggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeToggle", () => {
  it("TC-09 cycles the accessible name with click, Enter, and Space", async () => {
    const user = userEvent.setup();
    vi.setSystemTime(new Date(2026, 9, 16, 21, 0, 0));
    localStorage.setItem(THEME_STORAGE_KEY, "auto");

    const autoView = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const autoButton = await screen.findByRole("button", { name: "Theme: Auto" });
    expect(autoButton).toBeTruthy();

    await user.click(autoButton);

    expect(screen.getByRole("button", { name: "Theme: Light" })).toBeTruthy();

    autoView.unmount();
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    const lightView = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const lightButton = await screen.findByRole("button", { name: "Theme: Light" });
    lightButton.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: "Theme: Dark" })).toBeTruthy();

    lightView.unmount();
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const darkButton = await screen.findByRole("button", { name: "Theme: Dark" });
    darkButton.focus();
    await user.keyboard("[Space]");

    expect(screen.getByRole("button", { name: "Theme: Auto" })).toBeTruthy();
  });
});
