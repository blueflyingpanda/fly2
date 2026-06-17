import { useState } from "react";
import { setSchedule as apiSetSchedule, toggleSchedule } from "../core/api";
import { describeSchedule } from "../core/format";
import { useChat } from "../contexts/ChatContext";
import { useLocale } from "../contexts/LocaleContext";
import { useToast } from "../contexts/ToastContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Toggle } from "../ui/Toggle";

const PRESETS = ["1h", "4h", "6pm", "8am-11pm 2h"];

export function ScheduleEditor() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { info, patch } = useChat();

  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);

  const schedule = info?.schedule ?? "";
  const enabled = schedule !== "";

  const label = (() => {
    const d = describeSchedule(schedule);
    switch (d.key) {
      case "off":
        return t.sched_off;
      case "everyHour":
        return t.sched_everyHour;
      case "everyNHours":
        return t.sched_everyNHours(d.n!);
      case "dailyAt":
        return t.sched_dailyAt(d.hour!);
      case "range":
        return t.sched_range(d.hours!);
      default:
        return t.sched_custom;
    }
  })();

  const onToggle = async () => {
    setBusy(true);
    try {
      const res = await toggleSchedule();
      patch({ schedule: res.schedule });
    } catch (e) {
      toast(e instanceof Error ? e.message : t.errGeneric, "error");
    } finally {
      setBusy(false);
    }
  };

  const apply = async (pattern: string) => {
    if (!pattern.trim()) return;
    setBusy(true);
    try {
      const res = await apiSetSchedule(pattern.trim());
      patch({ schedule: res.schedule });
      setCustom("");
      toast(t.save, "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : t.errGeneric, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text">
            {enabled ? t.set_scheduleOn : t.set_scheduleOff}
          </p>
          {enabled && <p className="text-xs text-accent">{label}</p>}
        </div>
        <Toggle checked={enabled} onChange={onToggle} disabled={busy} />
      </div>

      {enabled && (
        <>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => apply(p)}
                disabled={busy}
                className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={t.set_scheduleCustomHint}
            />
            <Button size="md" onClick={() => apply(custom)} loading={busy} disabled={!custom.trim()}>
              {t.apply}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
