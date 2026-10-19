import Link from "next/link";
import { Wordmark } from "./Wordmark";

const links = [
  { href: "/vehiculos", label: "차량 카탈로그" },
  { href: "/vehiculos#comparar", label: "차량 비교" },
  { href: "/servicios", label: "포함 서비스" },
  { href: "/contacto", label: "문의하기" },
];

/** Aevum 레퍼런스: 왼쪽 메뉴 · 가운데 로고 · 오른쪽 CTA */
export function SiteHeader({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="container-page grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center">
          <details className="relative md:hidden">
            <summary
              className="flex cursor-pointer list-none items-center gap-2 text-xs text-charcoal [&::-webkit-details-marker]:hidden"
              aria-label="메뉴 열기"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3 6h14M3 10h10M3 14h14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              메뉴
            </summary>
            <nav aria-label="모바일 메뉴" className="absolute left-0 mt-3 w-56 rounded border border-silver bg-white p-2 shadow-lg">
              <ul>
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="block rounded px-3 py-3 text-sm hover:bg-cloud">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
          <nav aria-label="주 메뉴" className="hidden md:block">
            <ul className="flex items-center gap-6 text-xs text-graphite">
              {links.slice(0, 3).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-obsidian">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <Wordmark name={name} logoUrl={logoUrl} />
        <div className="flex justify-end">
          <Link href="/contacto" className="btn btn-primary btn-sm">문의하기</Link>
        </div>
      </div>
    </header>
  );
}
