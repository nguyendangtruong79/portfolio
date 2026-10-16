"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { useUI } from "@/components/providers/ui-provider";

function NotifierInner() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { setTerminalOpen } = useUI();

  useEffect(() => {
    if (searchParams.get("auth_required") === "true") {
      toast(
        "🔒 Restricted Dossier",
        "Open terminal and type /interview with your access key."
      );
      // Automatically open the terminal drawer for convenience
      setTerminalOpen(true);

      // Clean up URL query without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("auth_required");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [searchParams, toast, setTerminalOpen]);

  return null;
}

export function AuthRedirectNotifier() {
  return (
    <Suspense fallback={null}>
      <NotifierInner />
    </Suspense>
  );
}
