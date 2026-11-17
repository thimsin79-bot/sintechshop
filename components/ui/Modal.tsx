"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  printable?: boolean;
}

export function Modal({
  open,
  onClose,
  children,
  className = "max-w-lg",
  printable = false,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        id={printable ? "print-area" : undefined}
        role="dialog"
        aria-modal="true"
        className={cn(
          "bg-white rounded-2xl shadow-2xl w-full mx-3 sm:mx-4 max-h-[90dvh] overflow-y-auto",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
