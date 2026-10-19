import { PageTitle, Panel } from "@/components/admin/ui";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { getAdminContext } from "@/lib/admin";
import { resolveSiteBase } from "@/lib/site-url";
import type { Settings } from "@/lib/types";
import { createVehicle } from "../../actions";

export const metadata = { title: "차량 추가" };

export default async function NewVehiclePage() {
  const { supabase } = await getAdminContext();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
  const settings = data as Settings;
  return (
    <div className="max-w-3xl">
      <PageTitle title="차량 추가" />
      <Panel description="등록 후 사진 업로드, 인도 체크리스트를 이어서 설정할 수 있습니다.">
        <VehicleForm
          action={createVehicle}
          defaults={{ iva_rate: Number(settings.default_iva_rate), iva_applies: settings.default_iva_applies }}
          siteUrl={resolveSiteBase(settings).url}
          currency={settings.currency}
        />
      </Panel>
    </div>
  );
}
