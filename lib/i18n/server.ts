import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "./config";
import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  es,
};

export function parseAcceptLanguage(acceptLanguageHeader: string | null): Locale {
  if (!acceptLanguageHeader) return DEFAULT_LOCALE;

  const languages = acceptLanguageHeader.split(",").map((item) => {
    const [lang, qValue] = item.trim().split(";q=");
    return {
      lang: lang.toLowerCase(),
      quality: qValue ? parseFloat(qValue) : 1.0,
    };
  });

  languages.sort((a, b) => b.quality - a.quality);

  for (const { lang } of languages) {
    if (lang.startsWith("es")) return "es";
    if (lang.startsWith("en")) return "en";
  }

  return DEFAULT_LOCALE;
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  if (cookieLocale && LOCALES.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  const reqHeaders = await headers();
  const headerLocale = reqHeaders.get("x-locale");
  if (headerLocale && LOCALES.includes(headerLocale as Locale)) {
    return headerLocale as Locale;
  }

  const acceptLang = reqHeaders.get("accept-language");
  return parseAcceptLanguage(acceptLang);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
}

export function formatString(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }, template);
}
