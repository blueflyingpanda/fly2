import { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../core/config";
import { storage } from "../core/storage";
import { getTelegramColorScheme } from "../core/telegram";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const stored = storage.get(STORAGE_KEYS.theme);
  if (stored === "light" || stored === "dark") return stored;
  // Inside Telegram, follow the client's scheme; otherwise the OS preference.
  const tg = getTelegramColorScheme();
  if (tg) return tg;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    storage.set(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
