import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Button } from "./Button";

export function Page({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="mx-auto w-full max-w-2xl px-4 pb-28 pt-6"
    >
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </motion.div>
  );
}

export function EmptyState({ icon, message }: { icon?: ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border border-dashed border-border bg-card/40 px-6 py-12 text-center">
      {icon && <div className="text-accent">{icon}</div>}
      <p className="max-w-xs text-sm text-muted">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry, retryLabel }: { message: string; onRetry?: () => void; retryLabel: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border border-border bg-card/40 px-6 py-12 text-center">
      <p className="text-sm text-danger">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
