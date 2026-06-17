import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%", opacity: 0.6, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-border bg-bg p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-soft sm:max-w-md sm:rounded-3xl sm:pb-5"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border sm:hidden" />
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text">{title}</h3>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-muted transition-colors hover:bg-accent-soft hover:text-text"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
