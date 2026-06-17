// API contract types — mirror flytwo/src/api/models.py.
// Kept dependency-free so this module is reusable from React Native.

export interface Token {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
  chat_id: string;
}

export interface ChatInfo {
  chat_id: string;
  schedule: string; // rrule string, '' when disabled
  less: boolean; // silent mode
  last_notified: string | null; // ISO datetime
  premium: boolean;
  currency: string;
  directions_count: number;
}

export type NotifyPref = "any" | "increase" | "decrease";

export interface Direction {
  src: string;
  dst: string;
  travel_date: string; // ISO date (YYYY-MM-DD)
  price: number;
  notify_on_decrease: boolean | null;
  threshold: number;
}

export interface Airport {
  code: string;
  name: string;
  country: string;
  currency: string;
}

export interface CurrencyInfo {
  code: string;
  symbol: string | null;
}

export interface ConvertResult {
  amount: number;
  from_currency: string;
  to_currency: string;
  result: number;
}

export interface PromoFare {
  src: string;
  dst: string;
  price: number;
  currency: string;
  airline: string;
  travel_date: string;
}

export interface MessageResponse {
  detail: string;
  created?: boolean | null;
}

export interface ScheduleResponse {
  schedule: string;
}

export interface SilentResponse {
  less: boolean;
}

export interface PricePoint {
  price: number;
  dt: string; // ISO datetime
}

// airline -> travel_date -> price points
export type PriceHistory = Record<string, Record<string, PricePoint[]>>;

export interface CreateDirectionPayload {
  src?: string;
  dst?: string;
  travel_date?: string;
  price: number;
  link?: string;
}
