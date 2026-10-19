import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { getAdminContext } from "@/lib/admin";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: { default: "관리자", template: "%s | BS CARS 관리자" },
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/vehiculos", label: "차량 관리" },
  { href: "/admin/consultas", label: "고객 문의" },
  { href: "/admin/configuracion", label: "사업 설정" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await getAdminContext();

  return (
    <div className="min-h-screen bg-mist">
      <header className="bg-obsidian text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" aria-label="BS CARS 관리자 홈"><LogoMark className="h-[13px] w-auto text-white" /></Link>
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs">관리자</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-silver sm:inline">{user.email}</span>
            <Link href="/" target="_blank" className="text-silver hover:text-white">사이트 보기 ↗</Link>
            <form action={signOut}>
              <button type="submit" className="btn btn-outline-dark btn-sm">로그아웃</button>
            </form>
          </div>
        </div>
        {isAdmin && (
          <nav aria-label="관리자 메뉴" className="border-t border-white/10">
            <ul className="container-page flex gap-1 overflow-x-auto text-sm">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block whitespace-nowrap px-3 py-3 text-silver hover:text-white">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <main className="container-page py-8">
        {isAdmin ? (
          children
        ) : (
          <div className="rounded-lg border border-silver bg-white p-8" data-testid="not-admin">
            <h1 className="text-xl font-bold">관리자 권한이 없습니다</h1>
            <p className="mt-2 text-sm text-graphite">
              이 계정({user.email})은 관리자 목록(admins)에 등록되어 있지 않습니다. 배포 안내서의 &ldquo;관리자 계정
              생성&rdquo; 절차를 확인하세요.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
