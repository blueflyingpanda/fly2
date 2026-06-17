import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({ value, onChange, options, placeholder, disabled, className }: SelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-xl2 border border-border bg-surface px-3.5 pr-10 text-text outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );
}
