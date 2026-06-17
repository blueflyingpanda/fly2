import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { promo } from "../core/api";
import type { PromoFare } from "../core/types";
import { countryFlag, formatDate, formatMoney } from "../core/format";
import { useLocale } from "../contexts/LocaleContext";
import { useToast } from "../contexts/ToastContext";
import { useAirports } from "../hooks/useAirports";
import { AirportPicker } from "../ui/AirportPicker";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { EmptyState, Page } from "../ui/Page";
import { Spinner } from "../ui/Spinner";

export function PromoView() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { airports } = useAirports();

  const [src, setSrc] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PromoFare[] | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    try {
      setResults(await promo(src, date, Number(price)));
    } catch (err) {
      toast(err instanceof Error ? err.message : t.errGeneric, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title={t.promo_title} subtitle={t.promo_desc}>
      <form onSubmit={search} className="flex flex-col gap-4">
        <Field label={t.promo_from}>
          <AirportPicker value={src} onChange={setSrc} airports={airports} placeholder={t.promo_from} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.promo_date}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>
          <Field label={t.promo_maxPrice}>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="numeric"
              placeholder="150"
              required
            />
          </Field>
        </div>
        <Button type="submit" full loading={loading} disabled={!src || !date || !price}>
          <Sparkles className="h-4 w-4" /> {t.promo_search}
        </Button>
      </form>

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-10 text-muted">
            <Spinner className="h-7 w-7" />
            <p className="text-sm">{t.promo_searching}</p>
          </div>
        ) : results === null ? null : results.length === 0 ? (
          <EmptyState message={t.promo_noResults} />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted">
              {t.promo_results(results.length)}
            </p>
            {results.map((f, i) => (
              <motion.div
                key={`${f.dst}-${f.airline}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-2 font-semibold text-text">
                    <span>{f.src}</span>
                    <ArrowRight className="h-4 w-4 text-accent" />
                    <span>{countryFlag(airports.find((a) => a.code === f.dst)?.country ?? "")}</span>
                    <span>{f.dst}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-accent">{formatMoney(f.price, f.currency)}</span>
                    <span className="text-xs text-muted">{f.airline} · {formatDate(f.travel_date)}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
