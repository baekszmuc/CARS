import type { Metadata } from "next";
import { ComparisonTable } from "@/components/ComparisonTable";
import { PageHeader, SectionHeading } from "@/components/Section";
import { VehicleCard } from "@/components/VehicleCard";
import { getPublishedVehicles, getSettings, getSiteBase } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "차량 카탈로그 및 비교",
  description: "BS CARS 렌탈 차량의 연식, 주행거리, 기본 렌트료, IVA, IVA 포함 가격을 비교하세요.",
  alternates: { canonical: "/vehiculos" },
};

export default async function VehiclesPage() {
  const [settings, vehicles, base] = await Promise.all([getSettings(), getPublishedVehicles(), getSiteBase()]);
  return (
    <>
      <PageHeader
        eyebrow="Vehículos"
        title="전체 차량"
        description="차량별 기본 렌트료와 IVA, IVA 포함 금액을 확인하고 한눈에 비교하세요."
      />
      <div className="container-page py-14">
        {vehicles.length === 0 ? (
          <p className="text-graphite">현재 게시된 차량이 없습니다.</p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} currency={settings.currency} />
              ))}
            </div>
            <section id="comparar" className="mt-20 scroll-mt-24" aria-labelledby="compare-title">
              <SectionHeading
                id="compare-title"
                eyebrow="Comparar"
                title="차량 비교"
                description="확인되지 않은 정보는 '정보 확인 중'으로 표시됩니다."
              />
              <ComparisonTable vehicles={vehicles} settings={settings} base={base} />
            </section>
          </>
        )}
      </div>
    </>
  );
}
