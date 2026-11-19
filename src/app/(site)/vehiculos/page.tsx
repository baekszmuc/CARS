import { getT } from "@/i18n/server";
import type { Metadata } from "next";
import { ComparisonTable } from "@/components/ComparisonTable";
import { PageHeader, SectionHeading } from "@/components/Section";
import { VehicleCard } from "@/components/VehicleCard";
import { getPublishedVehicles, getSettings, getSiteBase } from "@/lib/data";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("차량 카탈로그 및 비교"),
    description: t("BS Select 렌탈 차량의 연식, 주행거리, 기본 렌트료, IVA, IVA 포함 가격을 비교하세요."),
    alternates: { canonical: "/vehiculos" },
  };
}

export default async function VehiclesPage() {
  const [settings, vehicles, base, { t }] = await Promise.all([getSettings(), getPublishedVehicles(), getSiteBase(), getT()]);
  return (
    <>
      <PageHeader
        eyebrow="Vehículos"
        title={t("차량 카탈로그")}
        description={t("차량별 기본 렌트료, IVA, 최종 렌트료와 사양을 확인하고 비교하세요.")}
      />
      <div className="container-page py-8">
        {vehicles.length === 0 ? (
          <p className="text-graphite">{t("현재 게시된 차량이 없습니다.")}</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} currency={settings.currency} index={i} />
              ))}
            </div>
            <section id="comparar" className="mt-16 scroll-mt-20" aria-labelledby="compare-title">
              <SectionHeading
                id="compare-title"
                eyebrow="Comparar"
                title={t("차량 비교")}
                description={t("확인되지 않은 정보는 '정보 확인 중'으로 표시됩니다.")}
              />
              <ComparisonTable vehicles={vehicles} settings={settings} base={base} />
            </section>
          </>
        )}
      </div>
    </>
  );
}
