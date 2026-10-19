import Link from "next/link";
import { HandoverList } from "@/components/HandoverList";
import { SectionHeading } from "@/components/Section";
import { VehicleCard } from "@/components/VehicleCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { serviceSummary } from "@/content/services";
import { ko } from "@/i18n/ko";
import { getHandoverItems, getPublishedVehicles, getSettings } from "@/lib/data";
import { buildGeneralInquiryMessage } from "@/lib/whatsapp";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, vehicles, handover] = await Promise.all([
    getSettings(),
    getPublishedVehicles(),
    getHandoverItems(),
  ]);

  return (
    <>
      <section className="bg-obsidian text-white">
        <div className="container-page py-20 sm:py-28">
          <p className="eyebrow">{settings.business_name}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {ko.hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-silver">{ko.hero.subtitle}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/vehiculos#comparar" className="btn btn-light">{ko.hero.compare}</Link>
            <Link href="/servicios" className="btn btn-outline-dark">{ko.hero.terms}</Link>
            <Link href="/contacto" className="btn btn-outline-dark">{ko.hero.contact}</Link>
          </div>
        </div>
      </section>

      <section className="container-page py-20" aria-labelledby="featured">
        <SectionHeading
          id="featured"
          eyebrow="Vehículos"
          title="렌탈 차량"
          description="모든 가격은 기본 렌트료, IVA, IVA 포함 금액으로 나누어 표시합니다."
        />
        {vehicles.length === 0 ? (
          <p className="text-graphite">현재 게시된 차량이 없습니다.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} currency={settings.currency} />
            ))}
          </div>
        )}
        <div className="mt-8">
          <Link href="/vehiculos#comparar" className="btn btn-outline">차량 비교표 보기</Link>
        </div>
      </section>

      <section className="bg-mist py-20" aria-labelledby="services">
        <div className="container-page">
          <SectionHeading
            id="services"
            eyebrow="Servicios"
            title="렌트료에 포함된 서비스"
            description="실제 적용 범위와 조건은 렌탈 계약서와 부속 문서를 기준으로 합니다."
          />
          <ul className="grid gap-px overflow-hidden rounded-lg border border-silver bg-silver sm:grid-cols-2 lg:grid-cols-3">
            {serviceSummary.map((s) => (
              <li key={s.title} className="bg-white p-6">
                <p className="font-bold">{s.title}</p>
                <p className="mt-1.5 text-sm text-graphite">{s.text}</p>
              </li>
            ))}
          </ul>
          <Link href="/servicios" className="btn btn-outline mt-8">포함 서비스 자세히 보기</Link>
        </div>
      </section>

      <section className="container-page py-20" aria-labelledby="handover">
        <SectionHeading
          id="handover"
          eyebrow="Entrega"
          title="차량 인수 시 함께 제공되는 항목"
          description="차량 서류, 비품, 열쇠가 함께 제공됩니다. 실제 제공 여부는 계약 및 차량별 확인 사항에 따릅니다."
        />
        <HandoverList items={handover} compact />
        <Link href="/incluye" className="btn btn-outline mt-8">전체 목록 보기</Link>
      </section>

      <section className="bg-charcoal py-20 text-white" aria-labelledby="contact">
        <div className="container-page grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow">Contacto</p>
            <h2 id="contact" className="mt-2 text-2xl font-bold sm:text-3xl">렌탈 상담</h2>
            <p className="mt-3 text-silver">
              {settings.inquiry_notice || "관심 차량과 희망 일정을 알려 주시면 이용 가능 여부와 렌탈 조건을 안내드립니다."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link href="/contacto" className="btn btn-light">문의 양식 작성</Link>
            <WhatsAppButton
              number={settings.whatsapp_number}
              message={buildGeneralInquiryMessage(settings)}
              className="btn btn-outline-dark"
              showMissingNotice={false}
            />
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`} className="btn btn-outline-dark">
                전화 {settings.phone}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
