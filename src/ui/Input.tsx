import { forwardRef } from "react";
import { cn } from "../lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const baseClasses =
  "h-11 w-full rounded-xl2 border border-border bg-surface px-3.5 text-text placeholder:text-muted/70 outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn(baseClasses, className)} {...props} />;
});
