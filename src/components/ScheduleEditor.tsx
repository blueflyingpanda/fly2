import { useEffect, useMemo, useState } from "react";
import { setSchedule as apiSetSchedule, toggleSchedule } from "../core/api";
import {
  type ScheduleMode,
  type ScheduleSpec,
  buildSchedulePattern,
  describeSchedule,
  formatHour,
} from "../core/format";
import { useChat } from "../contexts/ChatContext";
import { useLocale } from "../contexts/LocaleContext";
import { useToast } from "../contexts/ToastContext";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { SegmentedControl } from "../ui/SegmentedControl";
import { Select } from "../ui/Select";
import { Toggle } from "../ui/Toggle";

const INTERVAL_OPTS = [1, 2, 3, 4, 6, 8, 12];
const RANGE_STEP_OPTS = [1, 2, 3, 4, 6];
const HOURS = Array.from({ length: 24 }, (_, h) => h);

interface EditorState {
  mode: ScheduleMode;
  intervalHours: number;
  dailyHour: number;
  rangeStart: number;
  rangeEnd: number;
  rangeInterval: number;
}

function deriveState(rrule: string): EditorState {
  const s = describeSchedule(rrule);
  return {
    mode: s.kind === "daily" ? "daily" : s.kind === "range" ? "range" : "interval",
    intervalHours: s.kind === "interval" ? s.interval ?? 1 : 1,
    dailyHour: s.kind === "daily" ? s.hour ?? 9 : 9,
    rangeStart: s.kind === "range" ? s.start ?? 8 : 8,
    rangeEnd: s.kind === "range" ? s.end ?? 22 : 22,
    rangeInterval: s.kind === "range" ? s.interval ?? 1 : 1,
  };
}

export function ScheduleEditor() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { info, patch } = useChat();

  const schedule = info?.schedule ?? "";
  const enabled = schedule !== "";

  const [busy, setBusy] = useState(false);
  const [st, setSt] = useState<EditorState>(() => deriveState(schedule));

  // Keep the editor in sync with the stored schedule (toggle on, apply, refresh).
  useEffect(() => {
    if (schedule) setSt(deriveState(schedule));
  }, [schedule]);

  const label = useMemo(() => {
    const s = describeSchedule(schedule);
    switch (s.kind) {
      case "interval":
        return s.interval === 1 ? t.sched_everyHour : t.sched_everyNHours(s.interval!);
      case "daily":
        return t.sched_dailyAt(formatHour(s.hour!));
      case "range": {
        const range = `${formatHour(s.start!)}–${formatHour(s.end!)}`;
        return s.interval === 1
          ? t.sched_rangeHourly(range)
          : t.sched_rangeEvery(s.interval!, range);
      }
      default:
        return t.sched_custom;
    }
  }, [schedule, t]);

  const spec: ScheduleSpec =
    st.mode === "interval"
      ? { kind: "interval", interval: st.intervalHours }
      : st.mode === "daily"
        ? { kind: "daily", hour: st.dailyHour }
        : { kind: "range", start: st.rangeStart, end: st.rangeEnd, interval: st.rangeInterval };

  const pattern = buildSchedulePattern(spec);
  const rangeInvalid = st.mode === "range" && st.rangeStart >= st.rangeEnd;

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

  const apply = async () => {
    if (!pattern) return;
    setBusy(true);
    try {
      const res = await apiSetSchedule(pattern);
      patch({ schedule: res.schedule });
      toast(t.save, "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : t.errGeneric, "error");
    } finally {
      setBusy(false);
    }
  };

  const hourOptions = HOURS.map((h) => ({ value: String(h), label: formatHour(h) }));
  const stepOptions = (opts: number[]) =>
    opts.map((n) => ({ value: String(n), label: `${n} ${t.sched_hourAbbrev}` }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text">
            {enabled ? t.set_scheduleOn : t.set_scheduleOff}
          </p>
          {enabled && <p className="text-xs text-accent">{label}</p>}
        </div>
        <Toggle checked={enabled} onChange={onToggle} disabled={busy} />
      </div>

      {enabled && (
        <div className="flex flex-col gap-3">
          <SegmentedControl<ScheduleMode>
            value={st.mode}
            onChange={(mode) => setSt((p) => ({ ...p, mode }))}
            segments={[
              { value: "interval", label: t.sched_modeInterval },
              { value: "daily", label: t.sched_modeDaily },
              { value: "range", label: t.sched_modeRange },
            ]}
          />

          {st.mode === "interval" && (
            <Field label={t.sched_everyLabel}>
              <Select
                value={String(st.intervalHours)}
                onChange={(v) => setSt((p) => ({ ...p, intervalHours: Number(v) }))}
                options={stepOptions(INTERVAL_OPTS)}
              />
            </Field>
          )}

          {st.mode === "daily" && (
            <Field label={t.sched_atLabel}>
              <Select
                value={String(st.dailyHour)}
                onChange={(v) => setSt((p) => ({ ...p, dailyHour: Number(v) }))}
                options={hourOptions}
              />
            </Field>
          )}

          {st.mode === "range" && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <Field label={t.sched_fromLabel}>
                  <Select
                    value={String(st.rangeStart)}
                    onChange={(v) => setSt((p) => ({ ...p, rangeStart: Number(v) }))}
                    options={hourOptions}
                  />
                </Field>
                <Field label={t.sched_toLabel}>
                  <Select
                    value={String(st.rangeEnd)}
                    onChange={(v) => setSt((p) => ({ ...p, rangeEnd: Number(v) }))}
                    options={hourOptions}
                  />
                </Field>
              </div>
              <Field label={t.sched_everyLabel}>
                <Select
                  value={String(st.rangeInterval)}
                  onChange={(v) => setSt((p) => ({ ...p, rangeInterval: Number(v) }))}
                  options={stepOptions(RANGE_STEP_OPTS)}
                />
              </Field>
              {rangeInvalid && <p className="px-1 text-xs text-danger">{t.sched_invalidRange}</p>}
            </div>
          )}

          <Button full onClick={apply} loading={busy} disabled={!pattern}>
            {t.apply}
          </Button>
        </div>
      )}
    </div>
  );
}
