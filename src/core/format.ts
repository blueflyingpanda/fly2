// Pure formatting helpers — no DOM, safe to reuse on React Native.

/** ISO date (YYYY-MM-DD) -> DD.MM.YYYY (the format used across the bot). */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getUTCFullYear()}`;
}

/** ISO datetime -> "YYYY-MM-DD HH:mm". */
export function formatDateTime(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  INR: "₹",
  RUB: "₽",
  MDL: "L",
  UAH: "₴",
};

export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

export function formatMoney(amount: number, code: string): string {
  const sym = currencySymbol(code);
  return sym.length === 1 ? `${amount}${sym}` : `${amount} ${sym}`;
}

export type ScheduleMode = "interval" | "daily" | "range";

export interface ScheduleSpec {
  kind: "off" | "interval" | "daily" | "range" | "custom";
  /** interval: hours between checks (interval & range modes) */
  interval?: number;
  /** daily: hour of day (0-23) */
  hour?: number;
  /** range: first / last hour of day (0-23) */
  start?: number;
  end?: number;
}

/** Decode a stored rrule into a structured, lossless-enough spec for display + editing. */
export function describeSchedule(rrule: string): ScheduleSpec {
  if (!rrule) return { kind: "off" };

  const hourly = /FREQ=HOURLY;INTERVAL=(\d+)/.exec(rrule);
  if (hourly) {
    return { kind: "interval", interval: Number(hourly[1]) };
  }

  const byHour = /BYHOUR=([0-9,]+)/.exec(rrule);
  if (byHour) {
    const hours = byHour[1].split(",").map(Number);
    if (hours.length === 1) return { kind: "daily", hour: hours[0] };
    // recover the true step between fire-hours (e.g. 8,10,12,… -> every 2h)
    const interval = hours[1] - hours[0];
    return { kind: "range", start: hours[0], end: hours[hours.length - 1], interval };
  }

  return { kind: "custom" };
}

/** Format a 24h hour as a zero-padded clock label, e.g. 8 -> "08:00". */
export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

/** Convert a 24h hour to the am/pm token the backend ScheduleParser accepts (18 -> "6pm"). */
export function hourToken(hour: number): string {
  const period = hour < 12 ? "am" : "pm";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}${period}`;
}

/** Build a schedule pattern string the backend understands from structured input. */
export function buildSchedulePattern(spec: ScheduleSpec): string | null {
  switch (spec.kind) {
    case "interval":
      return spec.interval && spec.interval >= 1 ? `${spec.interval}h` : null;
    case "daily":
      return spec.hour === undefined ? null : hourToken(spec.hour);
    case "range": {
      const { start, end, interval = 1 } = spec;
      if (start === undefined || end === undefined || start >= end) return null;
      const base = `${hourToken(start)}-${hourToken(end)}`;
      return interval > 1 ? `${base} ${interval}h` : base;
    }
    default:
      return null;
  }
}

const NAME_TO_ISO2: Record<string, string> = {
  Moldova: "MD",
  "Republic of Moldova": "MD",
  Armenia: "AM",
  Romania: "RO",
  Russia: "RU",
  "Russian Federation": "RU",
  Ukraine: "UA",
  Italy: "IT",
  Germany: "DE",
  France: "FR",
  Spain: "ES",
  Portugal: "PT",
  "United Kingdom": "GB",
  "United Arab Emirates": "AE",
  Turkey: "TR",
  Türkiye: "TR",
  Greece: "GR",
  Austria: "AT",
  Belgium: "BE",
  Netherlands: "NL",
  Poland: "PL",
  "Czech Republic": "CZ",
  Czechia: "CZ",
  Hungary: "HU",
  Bulgaria: "BG",
  Switzerland: "CH",
  Ireland: "IE",
  Sweden: "SE",
  Norway: "NO",
  Denmark: "DK",
  Finland: "FI",
  Georgia: "GE",
  Azerbaijan: "AZ",
  Israel: "IL",
  Egypt: "EG",
  Cyprus: "CY",
  Serbia: "RS",
  Croatia: "HR",
  Montenegro: "ME",
  Albania: "AL",
  Lithuania: "LT",
  Latvia: "LV",
  Estonia: "EE",
  Slovakia: "SK",
  Slovenia: "SI",
  Belarus: "BY",
  Kazakhstan: "KZ",
  Uzbekistan: "UZ",
};

/** Best-effort country flag emoji from an ISO2 code or country name. */
export function countryFlag(country: string): string {
  if (!country) return "";
  let iso = country.trim();
  if (iso.length !== 2 || !/^[a-zA-Z]{2}$/.test(iso)) {
    const mapped = NAME_TO_ISO2[iso];
    if (!mapped) return "";
    iso = mapped;
  }
  const codePoints = iso
    .toUpperCase()
    .split("")
    .map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
}
