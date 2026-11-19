import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleDetail } from "@/components/VehicleDetail";
import { maxHpOf } from "@/components/VehicleOverview";
import { coverPhoto, getHandoverItems, getPublishedVehicle, getPublishedVehicles, getSettings, getSiteBase, photoUrl } from "@/lib/data";
import { brandLabel, formatKm, formatMoney, priceBreakdown, vehicleTitle } from "@/lib/format";
import { ko } from "@/i18n/ko";
import { vehicleUrl } from "@/lib/site-url";
import { getT } from "@/i18n/server";
import { translateValue } from "@/i18n/t";

// 표시 언어(쿠키·브라우저 언어)에 따라 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [vehicle, settings, { t, locale }] = await Promise.all([getPublishedVehicle(slug), getSettings(), getT()]);
  if (!vehicle) return { title: t("차량을 찾을 수 없습니다"), robots: { index: false } };
  const title = [brandLabel(vehicle), vehicleTitle(vehicle)].filter(Boolean).join(" ");
  const p = priceBreakdown(vehicle);
  const per = t(ko.billingUnitPer[p.unit]);
  const parts = [
    vehicle.variant ? translateValue(locale, vehicle.variant) : null,
    `${t("기본 렌트료")} ${formatMoney(p.base, settings.currency)} ${per}`,
    p.ivaApplies ? `${t("IVA 포함")} ${formatMoney(p.total, settings.currency)} ${per}` : null,
    formatKm(vehicle.mileage_km) ? `${t("주행거리")} ${formatKm(vehicle.mileage_km)}` : null,
  ].filter(Boolean);
  const description = t("{name} {title} 렌탈 — {parts}. 정비·보험 포함 서비스와 렌트 시 제공 품목을 확인하세요.", { name: settings.business_name, title, parts: parts.join(" · ") });
  const rental = t("{title} 렌탈", { title });
  const cover = coverPhoto(vehicle);
  const images = [
    cover
      ? { url: photoUrl(cover), alt: title }
      : { url: `/og/${vehicle.slug}`, width: 1200, height: 630, alt: title },
  ];
  return {
    title: rental,
    description,
    alternates: { canonical: `/vehiculos/${vehicle.slug}` },
    openGraph: {
      type: "website",
      title: `${rental} | ${settings.business_name}`,
      description,
      url: `/vehiculos/${vehicle.slug}`,
      images,
    },
    twitter: { card: "summary_large_image", title: rental, description, images },
  };
}

export default async function VehiclePage({ params }: Props) {
  const { slug } = await params;
  const [vehicle, settings, base, handover, all] = await Promise.all([
    getPublishedVehicle(slug),
    getSettings(),
    getSiteBase(),
    getHandoverItems(),
    getPublishedVehicles(),
  ]);
  if (!vehicle) notFound();
  const related = all.filter((v) => v.id !== vehicle.id).slice(0, 3);
  const url = vehicleUrl(base, vehicle.slug);
  const p = priceBreakdown(vehicle);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: vehicleTitle(vehicle),
    ...(vehicle.brand ? { brand: { "@type": "Brand", name: vehicle.brand } } : {}),
    url,
    offers: {
      "@type": "Offer",
      price: p.total.toFixed(2),
      priceCurrency: settings.currency,
      url,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <VehicleDetail vehicle={vehicle} settings={settings} url={url} handover={handover} related={related} maxHp={maxHpOf(all)} />
    </>
  );
}
