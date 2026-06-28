/**
 * Thin wrapper around the Telegram Mini App runtime (telegram-web-app.js).
 * Everything degrades gracefully to no-ops in a normal browser.
 */

interface TelegramWebApp {
  initData: string;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  ready: () => void;
  expand: () => void;
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  onEvent?: (event: string, cb: () => void) => void;
  offEvent?: (event: string, cb: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

/** True only when launched inside Telegram (initData is signed and present). */
export function isTelegramMiniApp(): boolean {
  const wa = getWebApp();
  return !!wa && typeof wa.initData === "string" && wa.initData.length > 0;
}

export function getInitData(): string | null {
  const wa = getWebApp();
  return wa && wa.initData ? wa.initData : null;
}

export function getTelegramColorScheme(): "light" | "dark" | null {
  const wa = getWebApp();
  return wa ? wa.colorScheme : null;
}

/**
 * Open an external URL. Inside Telegram, hand it to the client's openLink so it
 * launches the system browser; otherwise open a new tab.
 */
export function openExternal(url: string): void {
  const wa = getWebApp();
  if (wa?.openLink) {
    wa.openLink(url);
    return;
  }
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/** Signal readiness and request full-height layout. Safe to call always. */
export function initTelegram(): void {
  const wa = getWebApp();
  if (!wa) return;
  try {
    wa.ready();
    wa.expand();
  } catch {
    /* ignore */
  }
}
