import Link from "next/link";
import { CopyLinkButton } from "./CopyLinkButton";
import { HandoverList } from "./HandoverList";
import { PriceBlock } from "./PriceBlock";
import { InsuranceCard, MaintenanceCard, MunicipalCard, PartsCard, SupportCard, TiresCard } from "./ServicesDetail";
import { ShareButton } from "./ShareButton";
import { StatusBadge } from "./StatusBadge";
import { VehicleCard } from "./VehicleCard";
import { VehicleGallery } from "./VehicleGallery";
import { VehicleOverview } from "./VehicleOverview";
import { VehiclePhoto } from "./VehiclePhoto";
import { OptionInquiryButton } from "./OptionInquiryButton";
import { ko } from "@/i18n/ko";
import { photoUrl, sortPhotos } from "@/lib/data";
import { billingUnitLabel, brandLabel, formatKm, vehicleTitle } from "@/lib/format";
import { whatsappShareLink } from "@/lib/whatsapp";
import type { HandoverItem, Settings, Vehicle } from "@/lib/types";
import { getT } from "@/i18n/server";
import { translateValue } from "@/i18n/t";

function Block({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="reveal scroll-mt-32" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-center text-2xl font-normal sm:text-3xl">{title}</h2>
      <div className="mt-10">{children}</div>
    </section>
  );
}

export async function VehicleDetail({
  vehicle,
  settings,
  url,
  handover,
  related = [],
  maxHp,
}: {
  vehicle: Vehicle;
  settings: Settings;
  url: string;
  handover: HandoverItem[];
  related?: Vehicle[];
  maxHp: number;
}) {
  const { t, locale } = await getT();
  const tv = (v: string) => translateValue(locale, v);
  const title = vehicleTitle(vehicle);
  const brand = brandLabel(vehicle);
  const photos = sortPhotos(vehicle.vehicle_photos);
  const basics = [
    { label: t(ko.common.year), value: vehicle.model_year ? String(vehicle.model_year) : t(ko.common.pending) },
    { label: t(ko.common.mileage), value: formatKm(vehicle.mileage_km) ?? t(ko.common.pending) },
    { label: t("과금 단위"), value: t("{unit} 렌트", { unit: t(billingUnitLabel(vehicle.billing_unit)) }) },
    { label: t("상태"), value: t(ko.vehicleStatus[vehicle.status]) },
  ];

  const sections = [
    { id: "overview", label: t("개요") },
    { id: "spec", label: t("사양") },
    { id: "svc", label: t("포함 서비스") },
    { id: "handover", label: t("제공 품목") },
  ];

  return (
    <article>
      {/* 레퍼런스 구성: 검은 띠 위의 차량 사진 */}
      <div className="band-hero">
        <div className="container-page pt-6 sm:pt-10">
          <nav aria-label={t("경로")} className="mb-6 text-xs text-steel">
            <Link href="/vehiculos" className="hover:text-white">{t("차량 카탈로그")}</Link> <span aria-hidden="true">/</span>{" "}
            <span className="text-silver">{title}</span>
          </nav>
          <div className="mx-auto max-w-4xl">
            {photos.length > 1 ? (
              <VehicleGallery locale={locale} photos={photos.map((p) => ({ id: p.id, url: photoUrl(p), alt: p.alt || title, isReference: p.is_reference }))} />
            ) : (
              <VehiclePhoto photo={photos[0] ?? null} label={title} className="aspect-[16/10]" priority sizes="(min-width: 1024px) 896px, 100vw" />
            )}
            {photos.some((p) => p.is_reference) && (
              <p className="mt-2 text-[11px] text-graphite" data-testid="reference-note">
                {t("‘참고 이미지’ 표시가 있는 사진은 동일 모델의 참고 이미지이며, 실제 렌탈 차량과 색상·사양이 다를 수 있습니다.")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 차량명 */}
      <div className="container-page mt-10 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {brand && <p className="w-full text-[10px] tracking-[0.2em] text-steel">{brand.toUpperCase()}</p>}
          <h1 className="text-3xl font-normal sm:text-4xl" data-testid="vehicle-title">{title}</h1>
          {vehicle.variant && <p className="text-sm text-graphite">{tv(vehicle.variant)}</p>}
        </div>
        <StatusBadge status={vehicle.status} />
      </div>

      {/* 탭 (섹션 바로가기) */}
      <nav aria-label={t("차량 정보")} className="tab-labels sticky top-16 z-20 mt-8 border-b border-black/10 bg-cloud/95 backdrop-blur">
        <ul className="container-page flex justify-center gap-6 overflow-x-auto text-sm sm:gap-10">
          {sections.map((s, i) => (
            <li key={s.id} className="flex">
              <a href={`#${s.id}`} className={`relative px-1 py-3.5 text-graphite after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 hover:text-obsidian ${i === 0 ? "tab-link-active" : ""}`}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-page grid gap-20 py-14">
        {/* 개요: 게이지 · 상태 · 가격 */}
        <section id="overview" className="scroll-mt-32" aria-label={t("개요")}>
          <VehicleOverview vehicle={vehicle} maxHp={maxHp} />
          <p className="mt-6 text-center text-[11px] text-steel">{t("출력 게이지는 보유 차량 중 가장 높은 출력을 기준으로 표시합니다.")}</p>

          <div className="mx-auto mt-14 grid max-w-4xl gap-8 bg-white p-6 sm:p-10 md:grid-cols-2" data-testid="vehicle-main">
            <div>
              <PriceBlock vehicle={vehicle} currency={settings.currency} size="lg" />
              {!settings.iva_verified && (
                <p className="mt-2 text-[11px] text-graphite">{t("세금(IVA) 적용 방식은 계약 시 최종 확인됩니다.")}</p>
              )}
            </div>
            <div className="flex flex-col gap-3 md:pt-5">
              <OptionInquiryButton vehicle={vehicle} settings={settings} url={url} />
              <p className="text-[11px] text-graphite">{t("버튼을 누르면 이 차량 정보와 가격이 담긴 WhatsApp 메시지가 열립니다.")}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="sr-only" data-testid="vehicle-url">{url}</span>
                <CopyLinkButton url={url} locale={locale} />
                <a href={whatsappShareLink(`${settings.business_name} — ${title}\n${url}`)} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                  {t(ko.common.shareWhatsapp)}
                </a>
                <ShareButton url={url} title={`${title} | ${settings.business_name}`} label={t(ko.common.share)} />
              </div>
              <p className="text-[11px] leading-relaxed text-graphite">{t(ko.availabilityNotice)}</p>
            </div>
          </div>
        </section>

        {/* 사양 */}
        <Block title={t("차량 사양")} id="spec">
          <dl className="grid gap-x-12 bg-white px-6 py-2 sm:grid-cols-2">
            {[...basics, ...(vehicle.specs ?? [])].map((s) => (
              <div key={s.label} className="flex justify-between gap-6 border-b border-cloud py-3.5 text-sm">
                <dt className="shrink-0 text-xs text-graphite">{t(s.label)}</dt>
                <dd className="text-right">{tv(s.value)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] text-graphite">{vehicle.spec_note && locale === "ko" ? vehicle.spec_note : vehicle.spec_note ? t("공개 사양 자료 기준 참고 정보입니다. 실제 차량 사양은 인수 전 확인이 필요합니다.") : t("사양 정보는 확인되는 대로 추가됩니다.")}</p>
          {vehicle.description && locale === "ko" && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-charcoal">{vehicle.description}</p>}
        </Block>

        {/* 포함 서비스 */}
        <Block title={t("렌트료에 포함된 정비 및 교체")} id="svc">
          <div className="grid gap-5 lg:grid-cols-3">
            <MaintenanceCard />
            <PartsCard />
            <TiresCard />
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <MunicipalCard />
            <SupportCard settings={settings} />
          </div>
          <h3 className="mb-5 mt-14 text-center text-xl font-normal">{t("보험")}</h3>
          <div className="mx-auto max-w-2xl">
            <InsuranceCard settings={settings} />
          </div>
        </Block>

        {/* 서류·비품 */}
        <Block title={t("렌트 시 제공되는 서류 및 비품")} id="handover">
          <p className="-mt-4 mb-6 text-center text-sm text-graphite">
            {t("계약상 기본 제공 목록입니다. 각 항목의 실제 제공 여부는 계약 및 차량별 확인 사항에 따릅니다.")}
          </p>
          <HandoverList items={handover} />
        </Block>

        {/* 문의 */}
        <section className="bg-[#0e0f11] p-8 text-white sm:p-12" aria-labelledby="cta">
          <h2 id="cta" className="text-2xl font-normal">{t("{title} 렌탈 문의", { title })}</h2>
          <p className="mt-3 max-w-xl text-sm text-silver">
            {t("희망 일정을 알려 주시면 이용 가능 여부와 렌탈 조건을 안내드립니다. 문의만으로 예약이 확정되지는 않습니다.")}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <OptionInquiryButton vehicle={vehicle} settings={settings} url={url} className="btn btn-light" />
          </div>
        </section>

        {related.length > 0 && (
          <Block title={t("다른 차량 옵션")} id="related">
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
