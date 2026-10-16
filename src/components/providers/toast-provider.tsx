"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

interface Toast {
  id: number;
  message: string;
  detail?: string;
}

interface ToastApi {
  toast: (message: string, detail?: string) => void;
  copy: (value: string, label: string) => Promise<void>;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const toast = useCallback((message: string, detail?: string) => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-2), { id, message, detail }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const copy = useCallback(
    async (value: string, label: string) => {
      try {
        await navigator.clipboard.writeText(value);
        toast(`${label} copied`, value);
      } catch {
        toast("Clipboard unavailable", value);
      }
    },
    [toast],
  );

  const api = useMemo(() => ({ toast, copy }), [toast, copy]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl border border-line bg-surface-2/95 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-md"
            >
              <CheckCircle2 className="size-4 shrink-0 text-emerald" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg">{t.message}</p>
                {t.detail && (
                  <p className="truncate font-mono text-[11px] text-muted">{t.detail}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
