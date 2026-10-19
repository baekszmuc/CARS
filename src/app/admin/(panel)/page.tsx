import Link from "next/link";
import { Notice, PageTitle, Panel } from "@/components/admin/ui";
import { ko } from "@/i18n/ko";
import { getAdminContext } from "@/lib/admin";
import { formatDateTime, vehicleTitle } from "@/lib/format";
import { normalizeWhatsappNumber } from "@/lib/whatsapp";
import type { Inquiry, Settings, Vehicle } from "@/lib/types";

export default async function DashboardPage() {
  const { supabase } = await getAdminContext();
  const [vehiclesRes, inquiriesRes, recentInqRes, settingsRes] = await Promise.all([
    supabase.from("vehicles").select("id, name, model_year, slug, status, is_published, is_archived, created_at").order("created_at", { ascending: false }),
    supabase.from("inquiries").select("id, status"),
    supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("settings").select("*").eq("id", 1).single(),
  ]);
  const vehicles = (vehiclesRes.data ?? []) as Vehicle[];
  const inquiries = (inquiriesRes.data ?? []) as Pick<Inquiry, "id" | "status">[];
  const recentInquiries = (recentInqRes.data ?? []) as Inquiry[];
  const settings = settingsRes.data as Settings | null;

  const active = vehicles.filter((v) => !v.is_archived);
  const stats = [
    { label: "전체 차량", value: active.length, hint: `보관 ${vehicles.length - active.length}대 별도` },
    { label: "게시된 차량", value: active.filter((v) => v.is_published).length },
    { label: "이용 가능 차량", value: active.filter((v) => v.status === "available").length },
    { label: "예약 문의", value: inquiries.length, hint: `신규 ${inquiries.filter((i) => i.status === "new").length}건` },
  ];

  const missing: string[] = [];
  if (settings) {
    if (!normalizeWhatsappNumber(settings.whatsapp_number)) missing.push("WhatsApp 번호");
    if (!settings.site_domain) missing.push("웹사이트 도메인(실제 공개 주소)");
    if (!settings.phone) missing.push("전화번호");
    if (!settings.email) missing.push("이메일");
    if (!settings.iva_verified) missing.push("IVA 적용 여부·세율 확인");
  }

  return (
    <div className="grid gap-6">
      <PageTitle title="대시보드" />
      {missing.length > 0 && (
        <Notice tone="warn">
          <strong>설정이 필요한 항목:</strong> {missing.join(", ")}.{" "}
          <Link href="/admin/configuracion" className="font-semibold underline">사업 설정으로 이동</Link>
        </Notice>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-silver bg-white p-5" data-testid={`stat-${s.label}`}>
            <p className="text-sm text-graphite">{s.label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{s.value}</p>
            {s.hint && <p className="mt-1 text-xs text-graphite">{s.hint}</p>}
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="최근 등록 차량" actions={<Link href="/admin/vehiculos" className="text-sm underline">전체 보기</Link>}>
          <ul className="divide-y divide-silver text-sm">
            {vehicles.slice(0, 5).map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/admin/vehiculos/${v.id}`} className="font-semibold hover:underline">{vehicleTitle(v)}</Link>
                <span className="text-xs text-graphite">
                  {v.is_archived ? "보관됨" : v.is_published ? "게시 중" : "비공개"} · {ko.vehicleStatus[v.status]}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="최근 고객 문의" actions={<Link href="/admin/consultas" className="text-sm underline">전체 보기</Link>}>
          {recentInquiries.length === 0 ? (
            <p className="text-sm text-graphite">아직 접수된 문의가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-silver text-sm">
              {recentInquiries.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span>
                    <span className="font-semibold">{i.name}</span>
                    <span className="text-graphite"> · {i.vehicle_name ?? "차량 미정"}</span>
                  </span>
                  <span className="text-xs text-graphite">
                    {ko.inquiryStatus[i.status]} · {formatDateTime(i.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
