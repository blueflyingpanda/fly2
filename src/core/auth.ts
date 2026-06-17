import { API_BASE, STORAGE_KEYS } from "./config";
import { storage } from "./storage";
import type { Token } from "./types";

interface JwtPayload {
  chat_id: string;
  expire: string; // ISO datetime (see flytwo JwtPayload)
}

export function getStoredToken(): string | null {
  return storage.get(STORAGE_KEYS.token);
}

function storeToken(token: string): void {
  storage.set(STORAGE_KEYS.token, token);
}

export function clearToken(): void {
  storage.remove(STORAGE_KEYS.token);
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Returns the chat id from a valid, non-expired stored token, else null. */
export function getSession(): { chatId: string } | null {
  const token = getStoredToken();
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload) return null;
  if (payload.expire && new Date(payload.expire).getTime() <= Date.now()) {
    clearToken();
    return null;
  }
  return { chatId: payload.chat_id };
}

/** OTP login: chat id + 6-digit code from the bot's /auth command. */
export async function loginWithOtp(chatId: string, code: string): Promise<void> {
  const body = new URLSearchParams({ username: chatId.trim(), password: code.trim() });
  const res = await fetch(`${API_BASE}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const detail = await safeDetail(res);
    throw new Error(detail || "Login failed");
  }
  const data: Token = await res.json();
  storeToken(data.access_token);
}

/** Mini App login: exchange signed initData for a JWT. */
export async function loginWithTelegram(initData: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/telegram`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ init_data: initData }),
  });
  if (!res.ok) {
    const detail = await safeDetail(res);
    throw new Error(detail || "Telegram login failed");
  }
  const data: Token = await res.json();
  storeToken(data.access_token);
}

async function safeDetail(res: Response): Promise<string | null> {
  try {
    const data = await res.json();
    return typeof data?.detail === "string" ? data.detail : null;
  } catch {
    return null;
  }
}
