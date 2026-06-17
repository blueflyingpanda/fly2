import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../core/config";
import { storage } from "../core/storage";
import { type LocaleCode, type Translations, locales } from "../core/i18n/translations";

function getInitialLocale(): LocaleCode {
  const stored = storage.get(STORAGE_KEYS.locale);
  if (stored && stored in locales) return stored as LocaleCode;
  const browser =
    typeof navigator !== "undefined" ? navigator.language.slice(0, 2).toLowerCase() : "en";
  return browser in locales ? (browser as LocaleCode) : "en";
}

interface LocaleContextValue {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: Translations;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(getInitialLocale);

  const setLocale = useCallback((code: LocaleCode) => {
    storage.set(STORAGE_KEYS.locale, code);
    setLocaleState(code);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: locales[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
