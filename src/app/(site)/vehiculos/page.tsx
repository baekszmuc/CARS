import type { Metadata } from "next";
import { ComparisonTable } from "@/components/ComparisonTable";
import { SectionHeading } from "@/components/Section";
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
      <div className="container-page pt-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">차량 카탈로그</h1>
        <p className="mt-2 text-graphite">차량별 기본 렌트료, IVA, 최종 렌트료와 사양을 확인하고 비교하세요.</p>
      </div>
      <div className="container-page py-8">
        {vehicles.length === 0 ? (
          <p className="text-graphite">현재 게시된 차량이 없습니다.</p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} currency={settings.currency} index={i} />
              ))}
            </div>
            <section id="comparar" className="mt-16 scroll-mt-20" aria-labelledby="compare-title">
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
