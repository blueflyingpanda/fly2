import { getStoredToken } from "./auth";
import { API_BASE } from "./config";
import type {
  Airport,
  ChatInfo,
  ConvertResult,
  CreateDirectionPayload,
  CurrencyInfo,
  Direction,
  MessageResponse,
  NotifyPref,
  PriceHistory,
  PromoFare,
  ScheduleResponse,
  SilentResponse,
} from "./types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    unauthorizedHandler?.();
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") detail = data.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ── Account / info ──────────────────────────────────────────────────────────
export const getInfo = () => request<ChatInfo>("/info");

// ── Directions ───────────────────────────────────────────────────────────────
export const getDirections = () => request<Direction[]>("/directions");

export const addDirection = (payload: CreateDirectionPayload) =>
  request<MessageResponse>("/directions", { method: "POST", body: JSON.stringify(payload) });

export const removeDirection = (src: string, dst: string) =>
  request<MessageResponse>(`/directions/${src}/${dst}`, { method: "DELETE" });

export const updateDirection = (
  src: string,
  dst: string,
  patch: { notify?: NotifyPref; threshold?: number }
) =>
  request<MessageResponse>(`/directions/${src}/${dst}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

// ── Manual run ────────────────────────────────────────────────────────────────
export const runCheck = () => request<MessageResponse>("/go", { method: "POST" });

// ── Schedule / silent ─────────────────────────────────────────────────────────
export const getSchedule = () => request<ScheduleResponse>("/schedule");

export const setSchedule = (pattern: string) =>
  request<ScheduleResponse>("/schedule", { method: "PUT", body: JSON.stringify({ pattern }) });

export const toggleSchedule = () =>
  request<ScheduleResponse>("/schedule/toggle", { method: "POST" });

export const toggleSilent = () => request<SilentResponse>("/silent/toggle", { method: "POST" });

// ── Currency ──────────────────────────────────────────────────────────────────
export const getCurrencies = () => request<CurrencyInfo[]>("/currencies");

export const setCurrency = (currency: string) =>
  request<MessageResponse>("/currency", { method: "PUT", body: JSON.stringify({ currency }) });

export const convert = (amount: number, from: string, to: string) =>
  request<ConvertResult>(
    `/convert?amount=${amount}&from_currency=${encodeURIComponent(from)}&to_currency=${encodeURIComponent(to)}`
  );

// ── Promo ─────────────────────────────────────────────────────────────────────
export const promo = (src: string, travelDate: string, price: number) =>
  request<PromoFare[]>("/promo", {
    method: "POST",
    body: JSON.stringify({ src, travel_date: travelDate, price }),
  });

// ── Airports & price history ────────────────────────────────────────────────
export const getAirports = () => request<Airport[]>("/airports");

export const getPriceHistory = (
  src: string,
  dst: string,
  opts: { dt?: string; currency?: string } = {}
) => {
  const params = new URLSearchParams();
  if (opts.dt) params.set("dt", opts.dt);
  if (opts.currency) params.set("currency", opts.currency);
  const qs = params.toString();
  return request<PriceHistory>(`/price-history/${src}/${dst}${qs ? `?${qs}` : ""}`);
};
