import { AnimatePresence, motion } from "framer-motion";
import { Plane, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Airport } from "../core/types";
import { countryFlag } from "../core/format";
import { cn } from "../lib/cn";

interface AirportPickerProps {
  value: string;
  onChange: (code: string) => void;
  airports: Airport[];
  placeholder?: string;
}

export function AirportPicker({ value, onChange, airports, placeholder }: AirportPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const blurTimer = useRef<number | undefined>(undefined);

  const selected = useMemo(() => airports.find((a) => a.code === value), [airports, value]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? airports.filter(
          (a) =>
            a.code.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q) ||
            a.country.toLowerCase().includes(q)
        )
      : airports;
    return list.slice(0, 40);
  }, [airports, query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={open ? query : selected ? `${selected.code} — ${selected.name}` : ""}
          placeholder={placeholder}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onBlur={() => {
            blurTimer.current = window.setTimeout(() => setOpen(false), 120);
          }}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 w-full rounded-xl2 border border-border bg-surface pl-9 pr-3 text-text placeholder:text-muted/70 outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl2 border border-border bg-card shadow-soft"
          >
            {results.map((a) => (
              <li key={a.code}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(a.code);
                    setOpen(false);
                    if (blurTimer.current) window.clearTimeout(blurTimer.current);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-accent-soft",
                    a.code === value && "bg-accent-soft"
                  )}
                >
                  <Plane className="h-4 w-4 shrink-0 text-accent" />
                  <span className="font-semibold text-text">{a.code}</span>
                  <span className="truncate text-muted">{a.name}</span>
                  <span className="ml-auto shrink-0">{countryFlag(a.country)}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
