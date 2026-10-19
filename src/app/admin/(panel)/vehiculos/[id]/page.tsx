import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/admin/ActionButton";
import { HandoverChecklist } from "@/components/admin/HandoverChecklist";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { Notice, PageTitle, Panel } from "@/components/admin/ui";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { VEHICLE_FIELDS } from "@/lib/data";
import { getAdminContext } from "@/lib/admin";
import { vehicleTitle } from "@/lib/format";
import { resolveSiteBase, vehicleUrl } from "@/lib/site-url";
import { buildVehicleInquiryMessage, whatsappLink, whatsappShareLink } from "@/lib/whatsapp";
import type { HandoverCheck, HandoverItem, Settings, Vehicle } from "@/lib/types";
import { deleteVehicle, setArchived, setPublished, updateVehicle } from "../../actions";

export const metadata = { title: "차량 수정" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export default async function EditVehiclePage({ params, searchParams }: Props) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase } = await getAdminContext();
  const [vRes, sRes, itemsRes, checksRes] = await Promise.all([
    supabase.from("vehicles").select(VEHICLE_FIELDS).eq("id", id).maybeSingle(),
    supabase.from("settings").select("*").eq("id", 1).single(),
    supabase.from("handover_items").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("vehicle_handover_checks").select("*").eq("vehicle_id", id),
  ]);
  const vehicle = vRes.data as Vehicle | null;
  if (!vehicle) notFound();
  const settings = sRes.data as Settings;
  const base = resolveSiteBase(settings);
  const url = vehicleUrl(base, vehicle.slug);
  const waTest = whatsappLink(settings.whatsapp_number, buildVehicleInquiryMessage(vehicle, settings, url));

  return (
    <div className="grid gap-6">
      <PageTitle
        title={vehicleTitle(vehicle)}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/vehiculos/${vehicle.id}/vista-previa`} className="btn btn-outline btn-sm">미리보기</Link>
            {!vehicle.is_archived && (
              <ActionButton action={setPublished.bind(null, vehicle.id, !vehicle.is_published)} className="btn btn-primary btn-sm" testId="toggle-publish">
                {vehicle.is_published ? "게시 중단" : "지금 게시"}
              </ActionButton>
            )}
          </div>
        }
      />
      {created && <Notice tone="ok">차량이 등록되었습니다. 공개 URL이 자동 생성되었습니다.</Notice>}

      <Panel
        title="공개 URL"
        id="url"
        description={
          vehicle.is_published ? (
            <span className="font-semibold text-ok">게시 중 — 누구나 이 주소로 열람할 수 있습니다.</span>
          ) : (
            <span className="font-semibold text-warn">
              {vehicle.is_archived ? "보관됨" : "비공개"} — 게시하기 전까지 이 주소는 고객에게 열리지 않습니다(404).
            </span>
          )
        }
      >
        <p className="break-all rounded-md bg-mist px-3 py-2 font-mono text-sm" data-testid="admin-vehicle-url">{url}</p>
        {!base.isPublicDomain && (
          <p className="mt-2 text-xs text-warn">
            ⚠ 임시 주소입니다 ({base.source === "env" ? "환경 변수 NEXT_PUBLIC_SITE_URL" : base.source === "vercel" ? "Vercel 배포 주소" : "로컬 개발 주소"}).
            실제 공개 도메인은 <Link href="/admin/configuracion" className="underline">사업 설정</Link>에서 등록하세요.
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyLinkButton url={url} label="링크 복사" />
          <a href={`/vehiculos/${vehicle.slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm">차량 페이지 열기 ↗</a>
          <a href={whatsappShareLink(`${settings.business_name} — ${vehicleTitle(vehicle)}\n${url}`)} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">WhatsApp으로 공유</a>
          {waTest ? (
            <a href={waTest} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">고객 문의 메시지 확인</a>
          ) : (
            <span className="self-center text-xs text-warn">WhatsApp 번호 미등록 — 고객 문의 버튼이 표시되지 않습니다.</span>
          )}
        </div>
      </Panel>

      <Panel title="차량 정보 및 가격">
        <VehicleForm
          action={updateVehicle.bind(null, vehicle.id)}
          vehicle={vehicle}
          defaults={{ iva_rate: Number(settings.default_iva_rate), iva_applies: settings.default_iva_applies }}
          siteUrl={base.url}
          currency={settings.currency}
        />
      </Panel>

      <Panel title="차량 사진" description="첫 번째 대표 사진이 카드·상세 페이지·SNS 공유 이미지에 사용됩니다.">
        <PhotoManager vehicleId={vehicle.id} photos={vehicle.vehicle_photos ?? []} />
      </Panel>

      <Panel
        title="차량 인도 체크리스트"
        description="계약상 기본 제공 목록과 별개로, 이 차량에 실제로 제공되는지 인도 전에 확인합니다. 확인하지 않은 항목은 '미확인'으로 남겨 두세요."
      >
        <HandoverChecklist
          vehicleId={vehicle.id}
          items={(itemsRes.data ?? []) as HandoverItem[]}
          checks={(checksRes.data ?? []) as HandoverCheck[]}
        />
      </Panel>

      <Panel title="보관 및 삭제">
        <div className="flex flex-wrap gap-3">
          <ActionButton
            action={setArchived.bind(null, vehicle.id, !vehicle.is_archived)}
            confirm={vehicle.is_archived ? undefined : "차량을 보관하면 게시가 중단됩니다. 계속하시겠습니까?"}
          >
            {vehicle.is_archived ? "보관 해제" : "차량 보관 (게시 중단)"}
          </ActionButton>
          <ActionButton
            action={deleteVehicle.bind(null, vehicle.id)}
            className="btn btn-danger btn-sm"
            confirm="차량과 사진을 영구 삭제합니다. 되돌릴 수 없습니다. 계속하시겠습니까? (기록 보존이 필요하면 '보관'을 사용하세요)"
          >
            영구 삭제
          </ActionButton>
        </div>
        <p className="mt-2 text-xs text-graphite">삭제해도 기존 고객 문의 기록의 차량명은 유지됩니다.</p>
      </Panel>
    </div>
  );
}
