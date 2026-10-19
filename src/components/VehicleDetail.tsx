import Link from "next/link";
import { CopyLinkButton } from "./CopyLinkButton";
import { PriceBlock } from "./PriceBlock";
import { ShareButton } from "./ShareButton";
import { StatusBadge } from "./StatusBadge";
import { VehiclePhoto } from "./VehiclePhoto";
import { WhatsAppButton } from "./WhatsAppButton";
import { HandoverList } from "./HandoverList";
import { serviceSummary } from "@/content/services";
import { ko } from "@/i18n/ko";
import { sortPhotos } from "@/lib/data";
import { billingUnitLabel, formatKm, vehicleTitle } from "@/lib/format";
import { buildVehicleInquiryMessage, whatsappShareLink } from "@/lib/whatsapp";
import type { HandoverItem, Settings, Vehicle } from "@/lib/types";

export function VehicleDetail({
  vehicle,
  settings,
  url,
  handover,
}: {
  vehicle: Vehicle;
  settings: Settings;
  url: string;
  handover: HandoverItem[];
}) {
  const title = vehicleTitle(vehicle);
  const photos = sortPhotos(vehicle.vehicle_photos);
  const [cover, ...rest] = photos;
  const message = buildVehicleInquiryMessage(vehicle, settings, url);

  return (
    <article className="container-page py-10 sm:py-14">
      <nav aria-label="경로" className="mb-6 text-sm text-graphite">
        <Link href="/vehiculos" className="hover:underline">차량</Link> <span aria-hidden="true">/</span>{" "}
        <span className="text-obsidian">{title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <VehiclePhoto
            photo={cover ?? null}
            label={title}
            className="aspect-[16/10] rounded-lg"
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
          {rest.length > 0 && (
            <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4" aria-label="추가 사진">
              {rest.map((p) => (
                <li key={p.id}>
                  <VehiclePhoto photo={p} label={title} className="aspect-[4/3] rounded" sizes="25vw" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" data-testid="vehicle-title">
              {title}
            </h1>
            <StatusBadge status={vehicle.status} />
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-4 rounded-lg border border-silver p-4 text-sm">
            <div>
              <dt className="text-xs text-graphite">{ko.common.year}</dt>
              <dd className="mt-0.5 font-semibold">{vehicle.model_year ?? ko.common.pending}</dd>
            </div>
            <div>
              <dt className="text-xs text-graphite">{ko.common.mileage}</dt>
              <dd className="mt-0.5 font-semibold">{formatKm(vehicle.mileage_km) ?? ko.common.pending}</dd>
            </div>
            <div>
              <dt className="text-xs text-graphite">과금 단위</dt>
              <dd className="mt-0.5 font-semibold">{billingUnitLabel(vehicle.billing_unit)} 렌트</dd>
            </div>
          </dl>

          <div className="mt-5">
            <PriceBlock vehicle={vehicle} currency={settings.currency} size="lg" />
            {!settings.iva_verified && (
              <p className="mt-2 text-xs text-graphite">
                세금(IVA) 적용 방식은 계약 시 최종 확인됩니다.
              </p>
            )}
          </div>

          {vehicle.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-charcoal">{vehicle.description}</p>
          )}

          <div className="mt-6 grid gap-3">
            <WhatsAppButton number={settings.whatsapp_number} message={message} />
            <Link href={`/contacto?vehiculo=${vehicle.slug}`} className="btn btn-outline">
              문의 양식으로 상담 신청
            </Link>
          </div>

          <div className="mt-6 rounded-lg bg-mist p-4">
            <p className="text-sm font-semibold">이 차량 링크 공유</p>
            <p className="mt-1 break-all text-xs text-graphite" data-testid="vehicle-url">{url}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyLinkButton url={url} />
              <a
                href={whatsappShareLink(`${settings.business_name} — ${title}\n${url}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                {ko.common.shareWhatsapp}
              </a>
              <ShareButton url={url} title={`${title} | ${settings.business_name}`} />
            </div>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-graphite">{ko.availabilityNotice}</p>
        </div>
      </div>

      <section className="mt-16" aria-labelledby="incl-svc">
        <h2 id="incl-svc" className="text-2xl font-bold">렌트료에 포함된 서비스</h2>
        <ul className="mt-6 grid gap-px overflow-hidden rounded-lg border border-silver bg-silver sm:grid-cols-2 lg:grid-cols-3">
          {serviceSummary.map((s) => (
            <li key={s.title} className="bg-white p-5">
              <p className="font-bold">{s.title}</p>
              <p className="mt-1 text-sm text-graphite">{s.text}</p>
            </li>
          ))}
        </ul>
        <Link href="/servicios" className="btn btn-outline btn-sm mt-5">서비스 상세 조건 보기</Link>
      </section>

      <section className="mt-16" aria-labelledby="incl-items">
        <h2 id="incl-items" className="text-2xl font-bold">차량 인수 시 함께 제공되는 항목</h2>
        <p className="mb-6 mt-2 text-sm text-graphite">
          계약상 기본 제공 목록입니다. 각 항목의 실제 제공 여부는 계약 및 차량별 확인 사항에 따릅니다.
        </p>
        <HandoverList items={handover} />
      </section>
    </article>
  );
}
