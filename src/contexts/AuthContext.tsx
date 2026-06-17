import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { setUnauthorizedHandler } from "../core/api";
import {
  clearToken,
  getSession,
  loginWithOtp,
  loginWithTelegram,
} from "../core/auth";
import { getInitData, isTelegramMiniApp } from "../core/telegram";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: AuthStatus;
  chatId: string | null;
  /** True while the initial Telegram auto-login is in flight. */
  telegramPending: boolean;
  telegramError: string | null;
  loginOtp: (chatId: string, code: string) => Promise<void>;
  retryTelegram: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [chatId, setChatId] = useState<string | null>(null);
  const [telegramPending, setTelegramPending] = useState(false);
  const [telegramError, setTelegramError] = useState<string | null>(null);

  const applySession = useCallback(() => {
    const session = getSession();
    if (session) {
      setChatId(session.chatId);
      setStatus("authenticated");
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setChatId(null);
    setStatus("anonymous");
  }, []);

  const tryTelegram = useCallback(async () => {
    const initData = getInitData();
    if (!initData) return false;
    setTelegramPending(true);
    setTelegramError(null);
    try {
      await loginWithTelegram(initData);
      applySession();
      return true;
    } catch (e) {
      setTelegramError(e instanceof Error ? e.message : "Telegram sign-in failed");
      setStatus("anonymous");
      return false;
    } finally {
      setTelegramPending(false);
    }
  }, [applySession]);

  // Wire the API 401 handler to log out.
  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Bootstrap: existing session → Telegram auto-login → anonymous.
  useEffect(() => {
    if (applySession()) return;
    if (isTelegramMiniApp()) {
      void tryTelegram();
    } else {
      setStatus("anonymous");
    }
  }, [applySession, tryTelegram]);

  const loginOtp = useCallback(
    async (id: string, code: string) => {
      await loginWithOtp(id, code);
      applySession();
    },
    [applySession]
  );

  const retryTelegram = useCallback(() => {
    void tryTelegram();
  }, [tryTelegram]);

  return (
    <AuthContext.Provider
      value={{ status, chatId, telegramPending, telegramError, loginOtp, retryTelegram, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
