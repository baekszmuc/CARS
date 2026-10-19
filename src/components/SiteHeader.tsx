import Link from "next/link";
import { Wordmark } from "./Wordmark";

const links = [
  { href: "/vehiculos", label: "차량 카탈로그" },
  { href: "/vehiculos#comparar", label: "차량 비교" },
  { href: "/servicios", label: "포함 서비스" },
  { href: "/contacto", label: "문의하기" },
];

export function SiteHeader({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-silver bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Wordmark name={name} logoUrl={logoUrl} />
        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm font-medium text-graphite">
            {links.slice(0, 3).map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="rounded px-3 py-2 hover:bg-mist hover:text-obsidian">
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="ml-2">
              <Link href="/contacto" className="btn btn-primary btn-sm">문의하기</Link>
            </li>
          </ul>
        </nav>
        <details className="relative md:hidden">
          <summary
            className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md border border-silver [&::-webkit-details-marker]:hidden"
            aria-label="메뉴 열기"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </summary>
          <nav aria-label="모바일 메뉴" className="absolute right-0 mt-2 w-56 rounded-md border border-silver bg-white p-2 shadow-lg">
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block rounded px-3 py-3 text-sm hover:bg-mist">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
