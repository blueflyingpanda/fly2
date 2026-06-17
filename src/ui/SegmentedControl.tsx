import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "../lib/cn";

export interface Segment<T extends string> {
  value: T;
  label: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  segments,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  segments: Segment<T>[];
  className?: string;
}) {
  const groupId = useId();
  return (
    <div className={cn("flex rounded-xl2 border border-border bg-surface p-1", className)}>
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <button
            key={seg.value}
            type="button"
            onClick={() => onChange(seg.value)}
            className={cn(
              "relative flex-1 rounded-xl px-2 py-2 text-sm font-medium transition-colors",
              active ? "text-white" : "text-muted hover:text-text"
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${groupId}`}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 -z-0 rounded-xl bg-accent"
              />
            )}
            <span className="relative z-10">{seg.label}</span>
          </button>
        );
      })}
    </div>
  );
}
