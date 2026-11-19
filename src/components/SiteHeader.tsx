import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { getT } from "@/i18n/server";
import { localeShort, localeNames, siteLocales } from "@/i18n/locale";

const baseLinks = [
  { href: "/", label: "홈" },
  { href: "/vehiculos", label: "차량 카탈로그" },
  { href: "/vehiculos#comparar", label: "차량 비교" },
  { href: "/servicios", label: "포함 서비스" },
  { href: "/incluye", label: "렌트 시 제공 품목" },
  { href: "/contacto", label: "문의하기" },
];

/** 레퍼런스 구성: 왼쪽 메뉴 · 가운데 로고 · 오른쪽 문의 */
export async function SiteHeader({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  const { t, locale } = await getT();
  const links = baseLinks.map((l) => ({ ...l, label: t(l.label) }));
  return (
    <header className="site-header sticky top-0 z-30 border-b border-black/5 bg-[#f7f7f7]/95 backdrop-blur">
      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center gap-8">
          <details className="relative">
            <summary
              className="hdr-text flex cursor-pointer list-none items-center gap-2.5 text-sm text-charcoal hover:text-obsidian [&::-webkit-details-marker]:hidden"
              aria-label={t("메뉴 열기")}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              {t("메뉴")}
            </summary>
            <nav aria-label={t("메뉴")} className="absolute left-0 mt-4 w-60 border border-black/10 bg-white p-2 shadow-xl">
              <ul>
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="block px-3 py-3 text-sm hover:bg-cloud">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
          <nav aria-label={t("주 메뉴")} className="hidden lg:block">
            <ul className="flex items-center gap-6 text-xs text-graphite">
              {links.slice(1, 4).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hdr-text whitespace-nowrap hover:text-obsidian">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <Wordmark name={name} logoUrl={logoUrl} />
        <div className="flex items-center justify-end gap-5">
          <ul className="lang-switch flex items-center gap-2.5 text-[11px] tracking-[0.12em]" aria-label={t("언어")}>
            {siteLocales.map((l) => (
              <li key={l}>
                <a
                  href={`?lang=${l}`}
                  hrefLang={l}
                  lang={l}
                  title={localeNames[l]}
                  data-lang={l}
                  aria-current={l === locale ? "true" : undefined}
                  className={`hdr-text ${l === locale ? "font-semibold text-obsidian" : "text-steel hover:text-obsidian"}`}
                >
                  {localeShort[l]}
                </a>
              </li>
            ))}
          </ul>
          <Link href="/contacto" className="hdr-text hidden text-sm text-charcoal hover:text-obsidian sm:inline">{t("문의하기")}</Link>
        </div>
      </div>
    </header>
  );
}
