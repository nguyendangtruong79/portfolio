"use client";

import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/lib/use-focus-trap";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
  /** Layout of the positioning wrapper */
  placement?: "center" | "top" | "bottom";
  panelMotion?: Pick<HTMLMotionProps<"div">, "initial" | "animate" | "exit" | "transition">;
}

const placements = {
  center: "items-center justify-center p-4 sm:p-6",
  top: "items-start justify-center px-4 pt-[12vh]",
  bottom: "items-end justify-center",
};

const defaultMotion: DialogProps["panelMotion"] = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98 },
  transition: { type: "spring", stiffness: 380, damping: 34 },
};

/** Accessible modal shell: portal-less, focus-trapped, Esc + backdrop close. */
export function Dialog({
  open,
  onClose,
  labelledBy,
  children,
  className,
  placement = "center",
  panelMotion = defaultMotion,
}: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <DialogInner
          onClose={onClose}
          labelledBy={labelledBy}
          className={className}
          placement={placement}
          panelMotion={panelMotion}
        >
          {children}
        </DialogInner>
      )}
    </AnimatePresence>
  );
}

function DialogInner({
  onClose,
  labelledBy,
  children,
  className,
  placement = "center",
  panelMotion,
}: Omit<DialogProps, "open">) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, true, onClose);

  return (
    <div className={cn("fixed inset-0 z-[90] flex", placements[placement])}>
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[#05060a]/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        data-lenis-prevent
        className={cn("relative outline-none", className)}
        {...panelMotion}
      >
        {children}
      </motion.div>
    </div>
  );
}
