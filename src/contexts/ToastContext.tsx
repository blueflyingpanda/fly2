import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type];
            const color =
              t.type === "success"
                ? "text-success"
                : t.type === "error"
                  ? "text-danger"
                  : "text-accent";
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-2xl border border-border bg-card/95 px-4 py-3 text-sm text-text shadow-soft backdrop-blur"
              >
                <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                <span>{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
