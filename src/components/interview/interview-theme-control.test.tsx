import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InterviewDossierPage from "@/app/interview/page";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

vi.mock("@/lib/interview-auth", () => ({
  isInterviewAuthenticated: () => true,
  clearInterviewAuthSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/interview",
}));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("Interview theme control", () => {
  it("TC-10 places the theme button in the sticky header and not in main", async () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <InterviewDossierPage />
        </ToastProvider>
      </ThemeProvider>,
    );

    const button = await screen.findByRole("button", { name: /Theme: / });
    const header = button.closest("header");

    expect(header).not.toBeNull();
    expect(header?.classList.contains("sticky")).toBe(true);
    expect(button.closest("main")).toBeNull();
  });
});
