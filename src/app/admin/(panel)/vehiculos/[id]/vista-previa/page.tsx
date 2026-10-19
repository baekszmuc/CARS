import Link from "next/link";
import { notFound } from "next/navigation";
import { VehicleDetail } from "@/components/VehicleDetail";
import { Notice } from "@/components/admin/ui";
import { VEHICLE_FIELDS } from "@/lib/data";
import { getAdminContext } from "@/lib/admin";
import { resolveSiteBase, vehicleUrl } from "@/lib/site-url";
import type { HandoverItem, Settings, Vehicle } from "@/lib/types";

export const metadata = { title: "미리보기" };

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase } = await getAdminContext();
  const [vRes, sRes, iRes] = await Promise.all([
    supabase.from("vehicles").select(VEHICLE_FIELDS).eq("id", id).maybeSingle(),
    supabase.from("settings").select("*").eq("id", 1).single(),
    supabase.from("handover_items").select("*").eq("is_active", true).order("category").order("sort_order"),
  ]);
  const vehicle = vRes.data as Vehicle | null;
  if (!vehicle) notFound();
  const settings = sRes.data as Settings;
  return (
    <div>
      <Notice tone={vehicle.is_published ? "info" : "warn"}>
        관리자 미리보기 — {vehicle.is_published ? "현재 게시 중인 차량입니다." : "아직 게시되지 않은 차량입니다. 고객에게는 보이지 않습니다."}{" "}
        <Link href={`/admin/vehiculos/${vehicle.id}`} className="font-semibold underline">수정으로 돌아가기</Link>
      </Notice>
      <div className="mt-4 rounded-lg border border-silver bg-white">
        <VehicleDetail
          vehicle={vehicle}
          settings={settings}
          url={vehicleUrl(resolveSiteBase(settings), vehicle.slug)}
          handover={(iRes.data ?? []) as HandoverItem[]}
        />
      </div>
    </div>
  );
}
