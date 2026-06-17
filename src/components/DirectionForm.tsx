import { useState } from "react";
import { addDirection, updateDirection } from "../core/api";
import type { Airport, Direction, NotifyPref } from "../core/types";
import { useLocale } from "../contexts/LocaleContext";
import { useToast } from "../contexts/ToastContext";
import { AirportPicker } from "../ui/AirportPicker";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { SegmentedControl } from "../ui/SegmentedControl";

interface DirectionFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  airports: Airport[];
  editing?: Direction | null;
}

function prefFromDirection(d: Direction): NotifyPref {
  if (d.notify_on_decrease === null) return "any";
  return d.notify_on_decrease ? "decrease" : "increase";
}

export function DirectionForm({ open, onClose, onSaved, airports, editing }: DirectionFormProps) {
  const { t } = useLocale();
  const { toast } = useToast();
  const isEdit = !!editing;

  const [mode, setMode] = useState<"manual" | "link">("manual");
  const [src, setSrc] = useState(editing?.src ?? "");
  const [dst, setDst] = useState(editing?.dst ?? "");
  const [link, setLink] = useState("");
  const [date, setDate] = useState(editing?.travel_date ?? "");
  const [price, setPrice] = useState(editing ? String(editing.price) : "");
  const [notify, setNotify] = useState<NotifyPref>(editing ? prefFromDirection(editing) : "any");
  const [threshold, setThreshold] = useState(editing ? String(editing.threshold) : "0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const priceNum = Number(price);
      const byLink = mode === "link" && !isEdit;
      if (byLink) {
        await addDirection({ link: link.trim(), price: priceNum });
      } else {
        await addDirection({ src, dst, travel_date: date, price: priceNum });
      }
      // notify + threshold need a known src/dst. When adding by link we don't have
      // them client-side (they default to any/0 server-side); edit them afterwards.
      if (!byLink) {
        await updateDirection(isEdit ? editing!.src : src, isEdit ? editing!.dst : dst, {
          notify,
          threshold: Number(threshold),
        });
      }
      toast(t.dir_saved, "success");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errGeneric);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? t.dir_editTitle : t.dir_addTitle}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {!isEdit && (
          <SegmentedControl
            value={mode}
            onChange={setMode}
            segments={[
              { value: "manual", label: t.dir_byManual },
              { value: "link", label: t.dir_byLink },
            ]}
          />
        )}

        {mode === "link" && !isEdit ? (
          <Field label={t.dir_link}>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={t.dir_linkPlaceholder}
              required
            />
          </Field>
        ) : (
          <>
            <Field label={t.dir_from}>
              {isEdit ? (
                <Input value={src} disabled />
              ) : (
                <AirportPicker value={src} onChange={setSrc} airports={airports} placeholder={t.dir_from} />
              )}
            </Field>
            <Field label={t.dir_to}>
              {isEdit ? (
                <Input value={dst} disabled />
              ) : (
                <AirportPicker value={dst} onChange={setDst} airports={airports} placeholder={t.dir_to} />
              )}
            </Field>
            <Field label={t.dir_date}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </Field>
          </>
        )}

        <Field label={t.dir_priceLimit}>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="numeric"
            placeholder={t.dir_pricePlaceholder}
            required
          />
        </Field>

        <Field label={t.dir_notify}>
          <SegmentedControl
            value={notify}
            onChange={setNotify}
            segments={[
              { value: "any", label: t.dir_notify_any },
              { value: "decrease", label: t.dir_notify_decrease },
              { value: "increase", label: t.dir_notify_increase },
            ]}
          />
        </Field>

        <Field label={t.dir_threshold} hint={t.dir_thresholdHint}>
          <Input
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            inputMode="numeric"
          />
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button variant="ghost" full onClick={onClose}>
            {t.cancel}
          </Button>
          <Button type="submit" full loading={saving}>
            {t.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
