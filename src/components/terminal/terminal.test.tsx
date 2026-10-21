import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/providers/toast-provider";
import { UIProvider } from "@/components/providers/ui-provider";
import { Terminal } from "./terminal";

const push = vi.fn();
const isInterviewAuthenticated = vi.fn(() => false);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("lenis/react", () => ({
  useLenis: () => null,
}));

vi.mock("@/lib/interview-auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/interview-auth")>(
    "@/lib/interview-auth",
  );
  return {
    ...actual,
    isInterviewAuthenticated: () => isInterviewAuthenticated(),
    setInterviewAuthSession: vi.fn(),
  };
});

beforeEach(() => {
  push.mockReset();
  isInterviewAuthenticated.mockReturnValue(false);
});

afterEach(() => {
  cleanup();
});

function renderTerminal() {
  return render(
    <UIProvider>
      <ToastProvider>
        <Terminal />
      </ToastProvider>
    </UIProvider>,
  );
}

describe("Terminal /interview gateway", () => {
  it("with no session, /interview shows [sudo] password: immediately without SECURITY GATEWAY", async () => {
    const user = userEvent.setup();
    renderTerminal();

    await user.click(screen.getByRole("button", { name: "$ /interview" }));

    expect(screen.getByLabelText("Password input")).toBeTruthy();
    expect(screen.getByText("[sudo] password:")).toBeTruthy();
    expect(screen.queryByText(/SECURITY GATEWAY/i)).toBeNull();
  });

  it("with an active session, /interview redirects without asking for a password", async () => {
    isInterviewAuthenticated.mockReturnValue(true);
    const user = userEvent.setup();
    renderTerminal();

    await user.click(screen.getByRole("button", { name: "$ /interview" }));

    expect(screen.queryByLabelText("Password input")).toBeNull();
    expect(screen.getByText(/Session active/i)).toBeTruthy();
    expect(push).not.toHaveBeenCalled();

    await vi.waitFor(() => {
      expect(push).toHaveBeenCalledWith("/interview");
    });
  });
});
