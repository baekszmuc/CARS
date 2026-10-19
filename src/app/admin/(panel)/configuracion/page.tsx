import { LogoUploader } from "@/components/admin/LogoUploader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { Notice, PageTitle, Panel } from "@/components/admin/ui";
import { getAdminContext } from "@/lib/admin";
import { BRANDING_BUCKET, publicStorageUrl } from "@/lib/env";
import { resolveSiteBase } from "@/lib/site-url";
import type { Settings } from "@/lib/types";

export const metadata = { title: "사업 설정" };

export default async function SettingsPage() {
  const { supabase } = await getAdminContext();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
  const settings = data as Settings;
  const base = resolveSiteBase(settings);
  return (
    <div className="grid max-w-3xl gap-6">
      <PageTitle title="사업 설정" />
      <Notice tone={base.isPublicDomain ? "ok" : "warn"}>
        현재 링크 기준 주소: <strong className="font-mono">{base.url}</strong>{" "}
        {base.isPublicDomain ? "(실제 공개 도메인)" : "(임시 주소 — 실제 서비스 주소가 아닙니다)"}
      </Notice>
      <Panel title="로고">
        <LogoUploader currentUrl={settings.logo_path ? publicStorageUrl(BRANDING_BUCKET, settings.logo_path) : null} />
      </Panel>
      <Panel>
        <SettingsForm settings={settings} />
      </Panel>
    </div>
  );
}
