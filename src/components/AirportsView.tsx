import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { countryFlag } from "../core/format";
import { useLocale } from "../contexts/LocaleContext";
import { useAirports } from "../hooks/useAirports";
import { EmptyState } from "../ui/Page";
import { Spinner } from "../ui/Spinner";

export function AirportsView({ onBack }: { onBack: () => void }) {
  const { t } = useLocale();
  const { airports, loading } = useAirports();
  const [query, setQuery] = useState("");

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
    return [...list].sort((a, b) => a.code.localeCompare(b.code));
  }, [airports, query]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="mx-auto w-full max-w-2xl px-4 pb-28 pt-6"
    >
      <header className="mb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="grid h-10 w-10 place-items-center rounded-xl2 border border-border bg-card/60 text-text transition-colors hover:bg-accent-soft"
          aria-label={t.back}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-text">{t.airports_title}</h1>
      </header>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.airports_search}
          className="h-11 w-full rounded-xl2 border border-border bg-surface pl-9 pr-3 text-text placeholder:text-muted/70 outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7" />
        </div>
      ) : results.length === 0 ? (
        <EmptyState message={t.airports_empty} />
      ) : (
        <>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted">
            {t.airports_count(results.length)}
          </p>
          <div className="overflow-hidden rounded-xl2 border border-border bg-card/60">
            {results.map((a, i) => (
              <div
                key={a.code}
                className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? "border-t border-border" : ""}`}
              >
                <span className="w-12 shrink-0 font-bold text-accent">{a.code}</span>
                <span className="flex-1 truncate text-sm text-text">{a.name}</span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
                  {a.country} {countryFlag(a.country)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
