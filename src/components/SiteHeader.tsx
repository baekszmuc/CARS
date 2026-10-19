import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { ko } from "@/i18n/ko";

const links = [
  { href: "/vehiculos", label: ko.nav.vehicles },
  { href: "/servicios", label: ko.nav.services },
  { href: "/incluye", label: ko.nav.includes },
  { href: "/contacto", label: ko.nav.contact },
];

export function SiteHeader({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-obsidian text-white">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Wordmark name={name} logoUrl={logoUrl} inverted />
        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm font-medium text-silver">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/contacto" className="btn btn-light btn-sm hidden sm:inline-flex">
            {ko.hero.contact}
          </Link>
          <details className="relative md:hidden">
            <summary
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md border border-white/20 [&::-webkit-details-marker]:hidden"
              aria-label="메뉴 열기"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </summary>
            <nav
              aria-label="모바일 메뉴"
              className="absolute right-0 mt-2 w-56 rounded-md border border-white/10 bg-charcoal p-2 shadow-xl"
            >
              <ul>
                {[{ href: "/", label: ko.nav.home }, ...links].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="block rounded px-3 py-3 text-sm hover:bg-white/10">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
