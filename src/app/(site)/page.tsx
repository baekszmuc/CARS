import Link from "next/link";
import { ComparisonTable } from "@/components/ComparisonTable";
import { HandoverList } from "@/components/HandoverList";
import { SectionHeading } from "@/components/Section";
import { VehicleCard } from "@/components/VehicleCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { serviceSummary } from "@/content/services";
import { getHandoverItems, getPublishedVehicles, getSettings, getSiteBase } from "@/lib/data";
import { buildGeneralInquiryMessage } from "@/lib/whatsapp";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, vehicles, handover, base] = await Promise.all([
    getSettings(),
    getPublishedVehicles(),
    getHandoverItems(),
    getSiteBase(),
  ]);

  return (
    <>
      {/* 1. 차량 옵션 — Aevum "Find Your Car" 구성: 하늘색 그라데이션 제목 띠 + 바로 이어지는 카탈로그 */}
      <section aria-labelledby="options">
        <div className="bg-gradient-to-b from-sky via-[#dfe7f1] to-cloud">
          <div className="container-page pb-20 pt-12 text-center sm:pt-16">
            <p className="text-[10px] font-medium tracking-[0.2em] text-graphite">PARAGUAY · RENTAL</p>
            <h1 id="options" className="mt-3 text-3xl font-light tracking-tight text-obsidian sm:text-4xl">
              {settings.business_name} 차량 옵션
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-charcoal">
              차량별 가격과 포함 서비스를 비교하고, 필요한 옵션을 선택하세요.
            </p>
          </div>
        </div>
        <div className="container-page -mt-12">
          {vehicles.length === 0 ? (
            <p className="bg-white p-8 text-center text-graphite">현재 게시된 차량이 없습니다.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} currency={settings.currency} index={i} />
              ))}
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-graphite">
              모든 렌트료는 기본 렌트료와 IVA를 나누어 표시하며, 정비·보험 등 포함 서비스가 렌트료에 포함됩니다.
            </p>
            <Link href="#comparar" className="btn btn-outline btn-sm">차량 비교표 보기 ↓</Link>
          </div>
        </div>
      </section>

      {/* 2. 비교 */}
      {vehicles.length > 0 && (
        <section id="comparar" className="mt-16 scroll-mt-16 bg-white py-16" aria-labelledby="compare">
          <div className="container-page">
            <SectionHeading id="compare" eyebrow="Comparar" title="차량 비교" description="가격, 차량 정보, 사양을 한눈에 비교하세요." />
            <ComparisonTable vehicles={vehicles} settings={settings} base={base} />
          </div>
        </section>
      )}

      {/* 3. 포함 서비스 */}
      <section className="container-page py-16" aria-labelledby="services">
        <SectionHeading
          id="services"
          eyebrow="Servicios"
          title="렌트료에 포함된 서비스"
          description="모든 차량 옵션에 동일하게 포함됩니다. 실제 적용 범위와 조건은 렌탈 계약서와 부속 문서를 기준으로 합니다."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceSummary.map((s) => (
            <li key={s.title} className="flex flex-col bg-white p-6">
              <p className="text-[10px] tracking-[0.16em] text-steel">포함 서비스</p>
              <p className="mt-1 font-medium">{s.title}</p>
              <p className="mt-2 flex-1 text-sm text-graphite">{s.text}</p>
              <Link href="/servicios" className="mt-4 text-xs text-charcoal hover:text-obsidian">자세히 보기 →</Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-center">
          <Link href="/servicios" className="btn btn-primary btn-sm">정비 주기·보험 등 상세 조건 보기</Link>
        </div>
      </section>

      {/* 4. 인수 품목 */}
      <section className="container-page pb-16" aria-labelledby="handover">
        <SectionHeading
          id="handover"
          eyebrow="Entrega"
          title="차량 인수 시 함께 제공되는 항목"
          description="실제 제공 여부는 계약 및 차량별 확인 사항에 따릅니다."
        />
        <HandoverList items={handover} />
      </section>

      {/* 5. 문의 */}
      <section className="container-page pb-4" aria-labelledby="contact">
        <div className="grid gap-6 bg-obsidian p-8 text-white sm:p-10 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <h2 id="contact" className="text-2xl font-medium tracking-tight">렌탈 문의</h2>
            <p className="mt-2 text-sm text-silver">
              {settings.inquiry_notice || "관심 차량과 희망 일정을 알려 주시면 이용 가능 여부와 렌탈 조건을 안내드립니다."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link href="/contacto" className="btn btn-light">문의하기</Link>
            <WhatsAppButton number={settings.whatsapp_number} message={buildGeneralInquiryMessage(settings)} className="btn btn-outline-dark" showMissingNotice={false} />
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`} className="btn btn-outline-dark">전화 {settings.phone}</a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
