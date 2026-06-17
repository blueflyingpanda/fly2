import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl2 border border-border bg-card/80 p-4 backdrop-blur-sm",
        onClick && "cursor-pointer transition-colors hover:border-accent/50",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted">{children}</h2>
  );
}
