import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="px-1 text-sm font-medium text-text">{label}</span>}
      {children}
      {hint && <span className="px-1 text-xs text-muted">{hint}</span>}
    </label>
  );
}
