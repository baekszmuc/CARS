import { ko } from "./ko";

export const locales = ["ko"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ko";

const dictionaries = { ko } as const;

export function getDictionary(locale: Locale = defaultLocale) {
  return dictionaries[locale];
}
