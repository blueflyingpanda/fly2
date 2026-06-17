import { BarChart3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDirections, getPriceHistory } from "../core/api";
import type { Direction, PriceHistory } from "../core/types";
import { currencySymbol, formatDate } from "../core/format";
import { useChat } from "../contexts/ChatContext";
import { useLocale } from "../contexts/LocaleContext";
import { Card } from "../ui/Card";
import { EmptyState, Page } from "../ui/Page";
import { Select } from "../ui/Select";
import { Spinner } from "../ui/Spinner";

const PALETTE = ["#8B7FF0", "#22B8CF", "#F783AC", "#69DB7C", "#FFA94D", "#A78BFA", "#4DABF7"];

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function StatsView({ initial }: { initial?: { src: string; dst: string } | null }) {
  const { t } = useLocale();
  const { info } = useChat();
  const currency = info?.currency ?? "EUR";

  const [directions, setDirections] = useState<Direction[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [history, setHistory] = useState<PriceHistory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDirections()
      .then((dirs) => {
        setDirections(dirs);
        if (initial) setSelected(`${initial.src}-${initial.dst}`);
        else if (dirs.length) setSelected(`${dirs[0].src}-${dirs[0].dst}`);
      })
      .catch(() => setDirections([]));
  }, [initial]);

  useEffect(() => {
    if (!selected) return;
    const [src, dst] = selected.split("-");
    setLoading(true);
    setHistory(null);
    getPriceHistory(src, dst, { currency })
      .then(setHistory)
      .catch(() => setHistory({}))
      .finally(() => setLoading(false));
  }, [selected, currency]);

  const { data, series } = useMemo(() => {
    if (!history) return { data: [], series: [] as { key: string; color: string }[] };
    const seriesKeys: string[] = [];
    const byDate = new Map<string, Record<string, number>>();

    for (const [airline, byTravelDate] of Object.entries(history)) {
      for (const [travelDate, points] of Object.entries(byTravelDate)) {
        const key = `${airline} · ${formatDate(travelDate)}`;
        seriesKeys.push(key);
        for (const p of points) {
          const d = dayKey(p.dt);
          if (!byDate.has(d)) byDate.set(d, {});
          byDate.get(d)![key] = p.price;
        }
      }
    }

    const rows = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, prices]) => ({ date, ...prices }));

    return {
      data: rows,
      series: seriesKeys.map((key, i) => ({ key, color: PALETTE[i % PALETTE.length] })),
    };
  }, [history]);

  const routeOptions = directions.map((d) => ({
    value: `${d.src}-${d.dst}`,
    label: `${d.src} → ${d.dst}`,
  }));

  return (
    <Page title={t.stats_title}>
      {directions.length === 0 ? (
        <EmptyState icon={<BarChart3 className="h-8 w-8" />} message={t.dir_empty} />
      ) : (
        <div className="flex flex-col gap-4">
          <Select
            value={selected}
            onChange={setSelected}
            options={routeOptions}
            placeholder={t.stats_select}
          />

          <Card className="p-3">
            {loading ? (
              <div className="flex h-72 items-center justify-center">
                <Spinner className="h-7 w-7" />
              </div>
            ) : data.length === 0 ? (
              <div className="flex h-72 items-center justify-center px-6 text-center text-sm text-muted">
                {t.stats_noData}
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,140,160,0.18)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#9D97B5", fontSize: 11 }}
                      tickFormatter={(v: string) => formatDate(v).slice(0, 5)}
                      stroke="rgba(140,140,160,0.3)"
                    />
                    <YAxis
                      tick={{ fill: "#9D97B5", fontSize: 11 }}
                      stroke="rgba(140,140,160,0.3)"
                      width={44}
                      tickFormatter={(v: number) => `${v}${currencySymbol(currency)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgb(var(--color-card))",
                        border: "1px solid rgb(var(--color-border))",
                        borderRadius: 12,
                        color: "rgb(var(--color-text))",
                        fontSize: 12,
                      }}
                      labelFormatter={(v: string) => `${t.stats_trackingDate}: ${formatDate(v)}`}
                      formatter={(value: number) => [`${value} ${currency}`, ""]}
                    />
                    {series.map((s) => (
                      <Line
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        stroke={s.color}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {series.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
              {series.map((s) => (
                <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  {s.key}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Page>
  );
}
