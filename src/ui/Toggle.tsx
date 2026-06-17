import { motion } from "framer-motion";
import { cn } from "../lib/cn";

export function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full px-0.5 transition-colors disabled:opacity-50",
        checked ? "bg-accent" : "bg-border"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn(
          "h-6 w-6 rounded-full bg-white shadow",
          checked ? "ml-auto" : "ml-0"
        )}
      />
    </button>
  );
}
