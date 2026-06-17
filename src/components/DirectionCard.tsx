import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, BarChart3, Coins, Pencil, Trash2 } from "lucide-react";
import type { Airport, Direction } from "../core/types";
import { countryFlag, formatDate, formatMoney } from "../core/format";
import { useLocale } from "../contexts/LocaleContext";

function NotifyIcon({ value }: { value: boolean | null }) {
  if (value === null) return <ArrowUpDown className="h-3.5 w-3.5" />;
  return value ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />;
}

export function DirectionCard({
  direction,
  currency,
  airports,
  onEdit,
  onDelete,
  onStats,
}: {
  direction: Direction;
  currency: string;
  airports: Airport[];
  onEdit: () => void;
  onDelete: () => void;
  onStats: () => void;
}) {
  const { t } = useLocale();
  const srcCountry = airports.find((a) => a.code === direction.src)?.country ?? "";
  const dstCountry = airports.find((a) => a.code === direction.dst)?.country ?? "";

  const notifyLabel =
    direction.notify_on_decrease === null
      ? t.dir_notify_any
      : direction.notify_on_decrease
        ? t.dir_notify_decrease
        : t.dir_notify_increase;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="rounded-xl2 border border-border bg-card/80 p-4 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-lg font-semibold text-text">
          <span>{countryFlag(srcCountry)}</span>
          <span>{direction.src}</span>
          <ArrowRight className="h-4 w-4 text-accent" />
          <span>{countryFlag(dstCountry)}</span>
          <span>{direction.dst}</span>
        </div>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
          ≤ {formatMoney(direction.price, currency)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
        <span>✈️ {formatDate(direction.travel_date)}</span>
        <span className="inline-flex items-center gap-1">
          <NotifyIcon value={direction.notify_on_decrease} /> {notifyLabel}
        </span>
        <span className="inline-flex items-center gap-1">
          <Coins className="h-3.5 w-3.5" /> {t.dir_threshold}: {formatMoney(direction.threshold, currency)}
        </span>
      </div>

      <div className="mt-3 flex gap-1.5 border-t border-border pt-3">
        <CardAction icon={<BarChart3 className="h-4 w-4" />} label={t.dir_viewStats} onClick={onStats} />
        <CardAction icon={<Pencil className="h-4 w-4" />} label={t.edit} onClick={onEdit} />
        <CardAction
          icon={<Trash2 className="h-4 w-4" />}
          label={t.remove}
          onClick={onDelete}
          danger
        />
      </div>
    </motion.div>
  );
}

function CardAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium transition-colors hover:bg-accent-soft ${
        danger ? "text-danger hover:bg-danger/10" : "text-muted hover:text-text"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
