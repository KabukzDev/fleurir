"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./config";
import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  es,
};

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<Dictionary>;

interface LanguageContextType {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (newLocale: Locale | "auto") => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }, template);
}

export function LanguageProvider({
  initialLocale,
  initialDictionary,
  children,
}: {
  initialLocale: Locale;
  initialDictionary: Dictionary;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [dictionary, setDictionary] = useState<Dictionary>(initialDictionary);
  const router = useRouter();

  useEffect(() => {
    // If no cookie was set on server (auto-detected), check client navigator language as fallback
    const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
    const cookieVal = match ? decodeURIComponent(match[1]) : null;

    if (!cookieVal && typeof window !== "undefined") {
      const browserLang = window.navigator.language || "";
      const detected: Locale = browserLang.toLowerCase().startsWith("es") ? "es" : "en";
      if (detected !== locale) {
        setLocaleState(detected);
        setDictionary(dictionaries[detected] || dictionaries[DEFAULT_LOCALE]);
      }
    }
  }, [locale]);

  const setLocale = (newLocale: Locale | "auto") => {
    if (newLocale === "auto") {
      document.cookie = `${LOCALE_COOKIE}=; path=/; max-age=0`;
      const browserLang = typeof window !== "undefined" ? window.navigator.language || "" : "";
      const detected: Locale = browserLang.toLowerCase().startsWith("es") ? "es" : "en";
      setLocaleState(detected);
      setDictionary(dictionaries[detected] || dictionaries[DEFAULT_LOCALE]);
    } else {
      document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      setLocaleState(newLocale);
      setDictionary(dictionaries[newLocale] || dictionaries[DEFAULT_LOCALE]);
    }
    router.refresh();
  };

  const t = (key: TranslationKey | string, params?: Record<string, string | number>): string => {
    const raw = getNestedValue(dictionary, key);
    return interpolate(raw, params);
  };

  return (
    <LanguageContext.Provider value={{ locale, dictionary, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}

export function useLocale() {
  const context = useContext(LanguageContext);
  return context ? context.locale : DEFAULT_LOCALE;
}
