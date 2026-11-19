/** 고객용 사이트 언어. 한국어가 원문이며 es/en 은 원문 문장을 키로 하는 번역표를 쓴다. */
export const siteLocales = ["ko", "es", "en"] as const;
export type SiteLocale = (typeof siteLocales)[number];
export const LOCALE_COOKIE = "lang";

export const localeNames: Record<SiteLocale, string> = { ko: "한국어", es: "Español", en: "English" };
export const localeShort: Record<SiteLocale, string> = { ko: "KO", es: "ES", en: "EN" };
export const htmlLang: Record<SiteLocale, string> = { ko: "ko", es: "es", en: "en" };
export const ogLocale: Record<SiteLocale, string> = { ko: "ko_KR", es: "es_PY", en: "en_US" };

export function isSiteLocale(v: unknown): v is SiteLocale {
  return typeof v === "string" && (siteLocales as readonly string[]).includes(v);
}

/** 쿠키가 없을 때 브라우저 언어로 고른다 (스페인어·영어 브라우저는 그 언어로, 그 밖에는 한국어). */
export function localeFromAcceptLanguage(header: string | null): SiteLocale {
  if (!header) return "ko";
  for (const part of header.split(",")) {
    const tag = part.split(";")[0].trim().toLowerCase().slice(0, 2);
    if (tag === "ko") return "ko";
    if (tag === "es") return "es";
    if (tag === "en") return "en";
  }
  return "ko";
}
