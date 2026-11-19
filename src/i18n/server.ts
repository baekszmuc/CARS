import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { isSiteLocale, localeFromAcceptLanguage, LOCALE_COOKIE, type SiteLocale } from "./locale";
import { makeT } from "./t";

/** 요청마다 한 번: 쿠키(lang) → 브라우저 언어 → 한국어 */
export const getLocale = cache(async (): Promise<SiteLocale> => {
  const c = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isSiteLocale(c)) return c;
  return localeFromAcceptLanguage((await headers()).get("accept-language"));
});

export async function getT() {
  const locale = await getLocale();
  return { locale, t: makeT(locale) };
}
