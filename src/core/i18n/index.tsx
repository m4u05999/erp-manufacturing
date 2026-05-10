"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import ar from "./ar";
import en from "./en";

export type Locale = "ar" | "en";

const translations = { ar, en };

type I18nContextType = {
  locale: Locale;
  t: typeof ar;
  dir: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextType>({
  locale: "ar",
  t: ar,
  dir: "rtl",
  setLocale: () => {},
});

export function I18nProvider({ children, initialLocale = "ar" }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], dir: locale === "ar" ? "rtl" : "ltr", setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function getTranslations(locale: Locale) {
  return translations[locale];
}
