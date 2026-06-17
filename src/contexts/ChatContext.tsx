import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getInfo } from "../core/api";
import type { ChatInfo } from "../core/types";

interface ChatContextValue {
  info: ChatInfo | null;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
  patch: (partial: Partial<ChatInfo>) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfo] = useState<ChatInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setInfo(await getInfo());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const patch = useCallback((partial: Partial<ChatInfo>) => {
    setInfo((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <ChatContext.Provider value={{ info, loading, error, refresh, patch }}>
      {children}
    </ChatContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
