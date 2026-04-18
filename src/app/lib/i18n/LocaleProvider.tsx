"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import en from "messages/en.json";
import zh from "messages/zh.json";
import { getMessage, type Messages } from "lib/i18n/get-message";
import { LOCALE_PERSIST_KEY } from "lib/i18n/locale-persist-key";
import type { Locale } from "lib/i18n/locale-types";

export type { Locale };

const catalogs: Record<Locale, Messages> = {
  en,
  zh,
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function writeLocaleCookie(value: Locale) {
  document.cookie = `${LOCALE_PERSIST_KEY}=${value};path=/;max-age=31536000;SameSite=Lax`;
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_PERSIST_KEY) as Locale | null;
      const validStored = stored === "zh" || stored === "en" ? stored : null;

      if (validStored !== null && validStored !== initialLocale) {
        setLocaleState(validStored);
      }
      if (validStored === null) {
        localStorage.setItem(LOCALE_PERSIST_KEY, initialLocale);
      }

      const cookieLocale = validStored ?? initialLocale;
      writeLocaleCookie(cookieLocale);
    } catch {
      // ignore
    }
  }, [initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_PERSIST_KEY, next);
      writeLocaleCookie(next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (path: string) => getMessage(catalogs[locale], path),
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useTranslations(namespace: string) {
  const { t } = useLocale();
  return useCallback(
    (key: string) => t(`${namespace}.${key}`),
    [t, namespace]
  );
}
