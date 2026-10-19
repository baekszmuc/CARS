import Link from "next/link";
import { LogoMark } from "./LogoMark";
import type { Settings } from "@/lib/types";

/** Aevum 레퍼런스: 검정 바탕, 대문자 메뉴, 하단 대형 로고 */
export function SiteFooter({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  const contacts = [
    settings.phone && { label: settings.phone, href: `tel:${settings.phone.replace(/[^0-9+]/g, "")}` },
    settings.email && { label: settings.email, href: `mailto:${settings.email}` },
    settings.instagram_url && { label: "Instagram ↗", href: settings.instagram_url },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="mt-24 bg-obsidian text-silver">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr_1.2fr]">
          <nav aria-label="사이트 메뉴">
            <ul className="space-y-1.5 text-sm font-medium uppercase tracking-wide text-white">
              <li><Link className="hover:text-silver" href="/vehiculos">차량 카탈로그</Link></li>
              <li><Link className="hover:text-silver" href="/vehiculos#comparar">차량 비교</Link></li>
              <li><Link className="hover:text-silver" href="/servicios">포함 서비스</Link></li>
              <li><Link className="hover:text-silver" href="/incluye">인수 품목</Link></li>
            </ul>
          </nav>
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-white">문의</p>
            <ul className="mt-2 space-y-1.5 text-xs">
              {contacts.map((c) => (
                <li key={c.href}>
                  <a className="hover:text-white" href={c.href} {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {c.label}
                  </a>
                </li>
              ))}
              {settings.address && <li>{settings.address}</li>}
              {contacts.length === 0 && !settings.address && (
                <li className="text-steel">연락처 정보를 준비 중입니다. 문의 양식을 이용해 주세요.</li>
              )}
              <li><Link className="hover:text-white" href="/contacto">렌탈 문의 양식 ↗</Link></li>
            </ul>
          </div>
          <p className="text-xs leading-relaxed text-steel md:text-right">
            파라과이 차량 렌탈 및 차량 운영 관리 서비스.
            <br />
            표시된 가격과 서비스 조건은 렌탈 계약서를 기준으로 확정됩니다.
          </p>
        </div>
        <div className="mt-16 flex flex-col-reverse gap-6 border-t border-white/10 pt-8 md:flex-row md:items-end md:justify-between">
          <p className="text-[10px] text-steel">
            © {year} {settings.business_name} · <Link href="/privacidad" className="hover:text-white">개인정보 처리방침</Link>
          </p>
          <LogoMark title={settings.business_name} className="h-7 w-auto text-white sm:h-10" />
        </div>
      </div>
    </footer>
  );
}
