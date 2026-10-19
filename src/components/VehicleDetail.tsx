import Link from "next/link";
import { CopyLinkButton } from "./CopyLinkButton";
import { HandoverList } from "./HandoverList";
import { PriceBlock } from "./PriceBlock";
import { InsuranceCard, MaintenanceCard, MunicipalCard, PartsCard, SupportCard, TiresCard } from "./ServicesDetail";
import { ShareButton } from "./ShareButton";
import { StatusBadge } from "./StatusBadge";
import { VehicleCard } from "./VehicleCard";
import { VehicleGallery } from "./VehicleGallery";
import { VehiclePhoto } from "./VehiclePhoto";
import { OptionInquiryButton } from "./OptionInquiryButton";
import { ko } from "@/i18n/ko";
import { photoUrl, sortPhotos } from "@/lib/data";
import { billingUnitLabel, brandLabel, formatKm, specValue, vehicleTitle } from "@/lib/format";
import { whatsappShareLink } from "@/lib/whatsapp";
import type { HandoverItem, Settings, Vehicle } from "@/lib/types";

function Block({ n, title, id, children }: { n: string; title: string; id: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <p className="text-[10px] tracking-[0.16em] text-steel">{n}</p>
      <h2 id={id} className="mt-1 text-xl font-normal tracking-tight sm:text-2xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function VehicleDetail({
  vehicle,
  settings,
  url,
  handover,
  related = [],
}: {
  vehicle: Vehicle;
  settings: Settings;
  url: string;
  handover: HandoverItem[];
  related?: Vehicle[];
}) {
  const title = vehicleTitle(vehicle);
  const brand = brandLabel(vehicle);
  const photos = sortPhotos(vehicle.vehicle_photos);
  const short = (v: string | null) => (v ? v.replace(/\s*\(.*\)\s*/g, "").split(" · ")[0] : null);
  const stats = [
    { label: ko.common.year, value: vehicle.model_year ? String(vehicle.model_year) : ko.common.pending },
    { label: ko.common.mileage, value: formatKm(vehicle.mileage_km) ?? ko.common.pending },
    { label: "출력", value: short(specValue(vehicle, "출력")) ?? ko.common.pending },
  ];
  const highlights = ["변속기", "연료", "구동 방식", "승차 정원"]
    .map((label) => ({ label, value: short(specValue(vehicle, label)) }))
    .filter((h): h is { label: string; value: string } => Boolean(h.value));
  const basics = [
    { label: ko.common.year, value: vehicle.model_year ? String(vehicle.model_year) : ko.common.pending },
    { label: ko.common.mileage, value: formatKm(vehicle.mileage_km) ?? ko.common.pending },
    { label: "과금 단위", value: `${billingUnitLabel(vehicle.billing_unit)} 렌트` },
    { label: "상태", value: ko.vehicleStatus[vehicle.status] },
  ];

  return (
    <article className="container-page py-8 sm:py-10">
      <nav aria-label="경로" className="mb-6 text-sm text-graphite">
        <Link href="/vehiculos" className="hover:underline">차량 카탈로그</Link> <span aria-hidden="true">/</span>{" "}
        <span className="text-obsidian">{title}</span>
      </nav>

      {/* 1·2. 차량명 · 가격 · 주요 수치 (Aevum 제품 상단 구성) */}
      <div className="grid gap-8 bg-white p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div data-testid="vehicle-main">
          <div className="flex items-center gap-3">
            {brand && <p className="text-[10px] font-medium tracking-[0.18em] text-steel">{brand.toUpperCase()}</p>}
            <StatusBadge status={vehicle.status} />
          </div>
          <h1 className="mt-1 text-3xl font-normal tracking-tight sm:text-4xl" data-testid="vehicle-title">{title}</h1>
          {vehicle.variant && <p className="mt-1 text-sm text-graphite">{vehicle.variant}</p>}

          <div className="mt-6 max-w-md">
            <PriceBlock vehicle={vehicle} currency={settings.currency} size="lg" />
            {!settings.iva_verified && (
              <p className="mt-2 text-[11px] text-graphite">세금(IVA) 적용 방식은 계약 시 최종 확인됩니다.</p>
            )}
          </div>

          <div className="mt-5 flex max-w-md flex-col gap-2">
            <OptionInquiryButton vehicle={vehicle} settings={settings} url={url} />
            <p className="text-[11px] text-graphite">
              버튼을 누르면 이 차량 정보와 가격이 담긴 WhatsApp 메시지가 열립니다.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="sr-only" data-testid="vehicle-url">{url}</span>
            <CopyLinkButton url={url} />
            <a href={whatsappShareLink(`${settings.business_name} — ${title}\n${url}`)} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              {ko.common.shareWhatsapp}
            </a>
            <ShareButton url={url} title={`${title} | ${settings.business_name}`} />
          </div>
          <p className="mt-4 max-w-md text-[11px] leading-relaxed text-graphite">{ko.availabilityNotice}</p>
        </div>

        <div className="order-first min-w-0 lg:order-none">
          <dl className="mb-4 grid grid-cols-3 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="bg-cloud px-3 py-2.5">
                <dt className="text-[10px] text-graphite">{s.label}</dt>
                <dd className="mt-1 truncate text-sm font-medium" title={s.value}>{s.value}</dd>
              </div>
            ))}
          </dl>
          {photos.length > 1 ? (
            <VehicleGallery photos={photos.map((p) => ({ id: p.id, url: photoUrl(p), alt: p.alt || title, isReference: p.is_reference }))} />
          ) : (
            <VehiclePhoto photo={photos[0] ?? null} label={title} className="aspect-[16/10]" priority sizes="(min-width: 1024px) 55vw, 100vw" />
          )}
          {photos.some((p) => p.is_reference) && (
            <p className="mt-2 text-[11px] text-graphite" data-testid="reference-note">
              &lsquo;참고 이미지&rsquo; 표시가 있는 사진은 동일 모델의 참고 이미지이며, 실제 렌탈 차량과 색상·사양이 다를 수 있습니다.
            </p>
          )}
        </div>
      </div>

      {/* 주요 사양 하이라이트 (Aevum "Product Highlight") */}
      {highlights.length > 0 && (
        <section className="mt-4" aria-labelledby="highlight">
          <h2 id="highlight" className="sr-only">주요 사양</h2>
          <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {highlights.map((h) => (
              <div key={h.label} className="bg-white px-4 py-4">
                <dt className="text-[10px] text-graphite">{h.label}</dt>
                <dd className="mt-1.5 text-sm font-medium">{h.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className="mt-14 grid gap-14">
        {/* 3. 사양 */}
        <Block n="01" title="차량 사양" id="spec">
          <dl className="grid gap-x-12 bg-white px-6 py-2 sm:grid-cols-2">
            {[...basics, ...(vehicle.specs ?? [])].map((s) => (
              <div key={s.label} className="flex justify-between gap-6 border-b border-cloud py-3 text-sm">
                <dt className="shrink-0 text-xs text-graphite">{s.label}</dt>
                <dd className="text-right">{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] text-graphite">
            {vehicle.spec_note ?? "사양 정보는 확인되는 대로 추가됩니다."}
          </p>
          {vehicle.description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-charcoal">{vehicle.description}</p>}
        </Block>

        {/* 4. 정비·교체 */}
        <Block n="02" title="렌트료에 포함된 정비 및 교체" id="svc">
          <div className="grid gap-5 lg:grid-cols-3">
            <MaintenanceCard />
            <PartsCard />
            <TiresCard />
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <MunicipalCard />
            <SupportCard settings={settings} />
          </div>
        </Block>

        {/* 5. 보험 */}
        <Block n="03" title="보험" id="ins">
          <div className="max-w-2xl">
            <InsuranceCard settings={settings} />
          </div>
        </Block>

        {/* 6. 서류·비품 */}
        <Block n="04" title="렌트 시 제공되는 서류 및 비품" id="handover">
          <p className="-mt-2 mb-5 text-sm text-graphite">
            계약상 기본 제공 목록입니다. 각 항목의 실제 제공 여부는 계약 및 차량별 확인 사항에 따릅니다.
          </p>
          <HandoverList items={handover} />
        </Block>

        {/* 7. 문의 */}
        <section className="bg-obsidian p-8 text-white sm:p-10" aria-labelledby="cta">
          <h2 id="cta" className="text-2xl font-medium tracking-tight">{title} 렌탈 문의</h2>
          <p className="mt-2 max-w-xl text-sm text-silver">
            희망 일정을 알려 주시면 이용 가능 여부와 렌탈 조건을 안내드립니다. 문의만으로 예약이 확정되지는 않습니다.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <OptionInquiryButton vehicle={vehicle} settings={settings} url={url} className="btn btn-light" />
          </div>
        </section>

        {/* 8. 다른 옵션 */}
        {related.length > 0 && (
          <Block n="05" title="다른 차량 옵션" id="related">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((v) => (
                <VehicleCard key={v.id} vehicle={v} currency={settings.currency} />
              ))}
            </div>
          </Block>
        )}
      </div>
    </article>
  );
}
