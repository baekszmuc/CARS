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
import { WhatsAppButton } from "./WhatsAppButton";
import { ko } from "@/i18n/ko";
import { photoUrl, sortPhotos } from "@/lib/data";
import { billingUnitLabel, brandLabel, formatKm, vehicleTitle } from "@/lib/format";
import { buildVehicleInquiryMessage, whatsappShareLink } from "@/lib/whatsapp";
import type { HandoverItem, Settings, Vehicle } from "@/lib/types";

function Block({ n, title, id, children }: { n: string; title: string; id: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-silver pt-10" aria-labelledby={id}>
      <p className="text-[10px] font-bold tracking-[0.16em] text-steel">{n}</p>
      <h2 id={id} className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
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
  const message = buildVehicleInquiryMessage(vehicle, settings, url);
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

      {/* 1·2. 차량명 + 사진 / 가격 */}
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
        <div>
          {photos.length > 1 ? (
            <VehicleGallery photos={photos.map((p) => ({ id: p.id, url: photoUrl(p), alt: p.alt || title }))} />
          ) : (
            <VehiclePhoto photo={photos[0] ?? null} label={title} className="aspect-[16/10] rounded-xl" priority sizes="(min-width: 1024px) 60vw, 100vw" />
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start" data-testid="vehicle-main">
          <div className="flex items-center gap-3">
            {brand && <p className="text-[10px] font-bold tracking-[0.16em] text-steel">{brand.toUpperCase()}</p>}
            <StatusBadge status={vehicle.status} />
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl" data-testid="vehicle-title">{title}</h1>
          {vehicle.variant && <p className="mt-1 text-graphite">{vehicle.variant}</p>}

          <div className="mt-5">
            <PriceBlock vehicle={vehicle} currency={settings.currency} size="lg" />
            {!settings.iva_verified && (
              <p className="mt-2 text-xs text-graphite">세금(IVA) 적용 방식은 계약 시 최종 확인됩니다.</p>
            )}
          </div>

          <div className="mt-4 grid gap-2">
            <WhatsAppButton number={settings.whatsapp_number} message={message} />
            <Link href={`/contacto?vehiculo=${vehicle.slug}`} className="btn btn-outline">렌탈 문의하기</Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="sr-only" data-testid="vehicle-url">{url}</span>
            <CopyLinkButton url={url} />
            <a href={whatsappShareLink(`${settings.business_name} — ${title}\n${url}`)} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              {ko.common.shareWhatsapp}
            </a>
            <ShareButton url={url} title={`${title} | ${settings.business_name}`} />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-graphite">{ko.availabilityNotice}</p>
        </div>
      </div>

      <div className="mt-14 grid gap-14">
        {/* 3. 사양 */}
        <Block n="01" title="차량 사양" id="spec">
          <dl className="grid overflow-hidden rounded-xl border border-silver sm:grid-cols-2">
            {[...basics, ...(vehicle.specs ?? [])].map((s) => (
              <div key={s.label} className="flex justify-between gap-6 border-b border-silver px-5 py-3 text-sm sm:odd:border-r">
                <dt className="shrink-0 text-graphite">{s.label}</dt>
                <dd className="text-right font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-graphite">
            {vehicle.spec_note ?? "사양 정보는 확인되는 대로 추가됩니다."}
          </p>
          {vehicle.description && <p className="mt-4 whitespace-pre-line leading-relaxed text-charcoal">{vehicle.description}</p>}
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
        <Block n="04" title="차량 서류 및 인수 품목" id="handover">
          <p className="-mt-2 mb-5 text-sm text-graphite">
            계약상 기본 제공 목록입니다. 각 항목의 실제 제공 여부는 계약 및 차량별 확인 사항에 따릅니다.
          </p>
          <HandoverList items={handover} />
        </Block>

        {/* 7. 문의 */}
        <section className="rounded-xl bg-obsidian p-8 text-white sm:p-10" aria-labelledby="cta">
          <h2 id="cta" className="text-2xl font-bold tracking-tight">{title} 렌탈 문의</h2>
          <p className="mt-2 max-w-xl text-sm text-silver">
            희망 일정을 알려 주시면 이용 가능 여부와 렌탈 조건을 안내드립니다. 문의만으로 예약이 확정되지는 않습니다.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={`/contacto?vehiculo=${vehicle.slug}`} className="btn btn-light">문의 양식 작성</Link>
            <WhatsAppButton number={settings.whatsapp_number} message={message} className="btn btn-outline-dark" showMissingNotice={false} />
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
