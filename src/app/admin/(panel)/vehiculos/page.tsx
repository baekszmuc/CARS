import Link from "next/link";
import { ActionButton } from "@/components/admin/ActionButton";
import { Notice, PageTitle } from "@/components/admin/ui";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { ko } from "@/i18n/ko";
import { getAdminContext } from "@/lib/admin";
import { formatMoney, priceBreakdown, vehicleTitle, formatKm } from "@/lib/format";
import { resolveSiteBase, vehicleUrl } from "@/lib/site-url";
import type { Settings, Vehicle } from "@/lib/types";
import { setArchived, setPublished } from "../actions";

export const metadata = { title: "차량 관리" };

type Props = { searchParams: Promise<{ archived?: string; deleted?: string }> };

export default async function AdminVehiclesPage({ searchParams }: Props) {
  const { archived, deleted } = await searchParams;
  const showArchived = archived === "1";
  const { supabase } = await getAdminContext();
  const [{ data }, { data: settings }] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*")
      .eq("is_archived", showArchived)
      .order("sort_order")
      .order("created_at"),
    supabase.from("settings").select("*").eq("id", 1).single(),
  ]);
  const vehicles = (data ?? []) as Vehicle[];
  const base = resolveSiteBase(settings as Settings);
  const currency = (settings as Settings).currency;

  return (
    <div>
      <PageTitle
        title={showArchived ? "보관된 차량" : "차량 관리"}
        actions={
          <div className="flex gap-2">
            <Link href={showArchived ? "/admin/vehiculos" : "/admin/vehiculos?archived=1"} className="btn btn-outline btn-sm">
              {showArchived ? "운영 차량 보기" : "보관된 차량 보기"}
            </Link>
            <Link href="/admin/vehiculos/nuevo" className="btn btn-primary btn-sm">+ 차량 추가</Link>
          </div>
        }
      />
      {deleted && <div className="mb-4"><Notice tone="ok">차량이 삭제되었습니다.</Notice></div>}
      {!base.isPublicDomain && (
        <div className="mb-4">
          <Notice tone="warn">
            실제 공개 도메인이 등록되지 않았습니다. 아래 링크는 <strong>임시 주소({base.url})</strong> 기준입니다.
          </Notice>
        </div>
      )}
      {vehicles.length === 0 ? (
        <p className="rounded-lg border border-silver bg-white p-6 text-sm text-graphite">차량이 없습니다.</p>
      ) : (
        <ul className="grid gap-3">
          {vehicles.map((v) => {
            const p = priceBreakdown(v);
            const url = vehicleUrl(base, v.slug);
            return (
              <li key={v.id} className="rounded-lg border border-silver bg-white p-4 sm:p-5" data-testid={`admin-vehicle-${v.slug}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/vehiculos/${v.id}`} className="text-lg font-bold hover:underline">{vehicleTitle(v)}</Link>
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${v.is_published ? "bg-[#e7f4ed] text-ok" : "bg-silver text-charcoal"}`}>
                        {v.is_archived ? "보관됨" : v.is_published ? "게시 중" : "비공개"}
                      </span>
                      <span className="rounded bg-mist px-2 py-0.5 text-xs">{ko.vehicleStatus[v.status]}</span>
                    </div>
                    <p className="mt-1 text-sm text-graphite">
                      {formatMoney(p.base, currency)} {p.ivaApplies ? `+ IVA ${formatMoney(p.iva, currency)} = ${formatMoney(p.total, currency)}` : "(IVA 미적용)"} {ko.billingUnitPer[p.unit]}
                      {" · "}
                      {formatKm(v.mileage_km) ?? "주행거리 확인 중"}
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-graphite">{url}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/vehiculos/${v.id}`} className="btn btn-primary btn-sm">수정</Link>
                    <Link href={`/admin/vehiculos/${v.id}/vista-previa`} className="btn btn-outline btn-sm">미리보기</Link>
                    {v.is_published && (
                      <>
                        <CopyLinkButton url={url} label="공개 링크 복사" />
                        <a href={`/vehiculos/${v.slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm">페이지 열기 ↗</a>
                      </>
                    )}
                    {!v.is_archived && (
                      <ActionButton action={setPublished.bind(null, v.id, !v.is_published)} testId={`toggle-publish-${v.slug}`}>
                        {v.is_published ? "게시 중단" : "게시"}
                      </ActionButton>
                    )}
                    <ActionButton
                      action={setArchived.bind(null, v.id, !v.is_archived)}
                      confirm={v.is_archived ? undefined : "이 차량을 보관하시겠습니까? 공개 페이지에서 내려갑니다."}
                    >
                      {v.is_archived ? "보관 해제" : "보관"}
                    </ActionButton>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
