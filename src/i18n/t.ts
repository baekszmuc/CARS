import { es } from "./es";
import { en } from "./en";
import type { SiteLocale } from "./locale";

/**
 * 번역 함수. 키는 한국어 원문 그대로이며, 번역이 없으면 원문(한국어)을 돌려준다.
 * 변수는 {name} 형식: t("{n}개 항목", { n: 3 })
 */
const catalogs: Record<Exclude<SiteLocale, "ko">, Record<string, string>> = { es, en };

export type T = (text: string, vars?: Record<string, string | number>) => string;

function fill(text: string, vars?: Record<string, string | number>) {
  return vars ? text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : text;
}

export function translate(locale: SiteLocale, text: string, vars?: Record<string, string | number>): string {
  if (locale === "ko") return fill(text, vars);
  return fill(catalogs[locale][text] ?? text, vars);
}

export function makeT(locale: SiteLocale): T {
  return (text, vars) => translate(locale, text, vars);
}

/**
 * DB에 한국어로 저장된 짧은 값(사양 값·세부 모델 등)을 번역한다.
 * 통째로 번역이 있으면 그것을, 없으면 " · " 로 나눈 조각별로 번역한다.
 */
export function translateValue(locale: SiteLocale, value: string): string {
  if (locale === "ko") return value;
  const cat = catalogs[locale];
  if (cat[value]) return cat[value];
  return value
    .split(" · ")
    .map((part) => cat[part] ?? part)
    .join(" · ");
}
