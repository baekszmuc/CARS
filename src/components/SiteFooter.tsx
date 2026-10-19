import Link from "next/link";
import { LogoMark } from "./LogoMark";
import type { Settings } from "@/lib/types";

export function SiteFooter({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 bg-obsidian text-silver">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <LogoMark title={settings.business_name} className="h-[14px] w-auto text-white" />
          <p className="mt-3 text-sm leading-relaxed text-steel">파라과이 차량 렌탈 및 차량 운영 관리 서비스</p>
        </div>
        <div>
          <p className="eyebrow">연락처</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {settings.phone && <li>전화: {settings.phone}</li>}
            {settings.email && (
              <li>
                이메일:{" "}
                <a className="underline-offset-2 hover:underline" href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && <li>주소: {settings.address}</li>}
            {settings.instagram_url && (
              <li>
                <a className="hover:underline" href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            )}
            {!settings.phone && !settings.email && !settings.address && (
              <li className="text-steel">연락처 정보를 준비 중입니다. 문의 양식을 이용해 주세요.</li>
            )}
          </ul>
        </div>
        <div>
          <p className="eyebrow">안내</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li><Link className="hover:text-white" href="/vehiculos">차량 비교</Link></li>
            <li><Link className="hover:text-white" href="/servicios">포함 서비스</Link></li>
            <li><Link className="hover:text-white" href="/incluye">인수 품목</Link></li>
            <li><Link className="hover:text-white" href="/contacto">렌탈 문의</Link></li>
            <li><Link className="hover:text-white" href="/privacidad">개인정보 처리방침</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-page py-5 text-xs text-steel">
          © {year} {settings.business_name}. 표시된 가격과 서비스 조건은 렌탈 계약서를 기준으로 확정됩니다.
        </p>
      </div>
    </footer>
  );
}
