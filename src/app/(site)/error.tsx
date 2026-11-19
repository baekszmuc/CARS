"use client";

import { isSiteLocale, type SiteLocale } from "@/i18n/locale";
import { translate } from "@/i18n/t";

function currentLocale(): SiteLocale {
  const l = typeof document !== "undefined" ? document.documentElement.lang : "ko";
  return isSiteLocale(l) ? l : "ko";
}

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  const t = (s: string) => translate(currentLocale(), s);
  return (
    <div className="container-page py-28 text-center">
      <h1 className="text-2xl font-bold">{t("정보를 불러오지 못했습니다")}</h1>
      <p className="mt-3 text-graphite">{t("잠시 후 다시 시도해 주세요.")}</p>
      <button type="button" className="btn btn-primary mt-8" onClick={reset}>{t("다시 시도")}</button>
    </div>
  );
}
