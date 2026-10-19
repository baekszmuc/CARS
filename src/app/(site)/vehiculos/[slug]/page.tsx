import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleDetail } from "@/components/VehicleDetail";
import { coverPhoto, getHandoverItems, getPublishedVehicle, getPublishedVehicles, getSettings, getSiteBase, photoUrl } from "@/lib/data";
import { brandLabel, formatKm, formatMoney, priceBreakdown, vehicleTitle } from "@/lib/format";
import { ko } from "@/i18n/ko";
import { vehicleUrl } from "@/lib/site-url";

export const revalidate = 300;
// 새로 게시된 차량도 첫 요청 시 렌더링한다 (차량별 HTML을 따로 만들지 않음)
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [vehicle, settings] = await Promise.all([getPublishedVehicle(slug), getSettings()]);
  if (!vehicle) return { title: "차량을 찾을 수 없습니다", robots: { index: false } };
  const title = [brandLabel(vehicle), vehicleTitle(vehicle)].filter(Boolean).join(" ");
  const p = priceBreakdown(vehicle);
  const per = ko.billingUnitPer[p.unit];
  const parts = [
    vehicle.variant,
    `기본 렌트료 ${formatMoney(p.base, settings.currency)} ${per}`,
    p.ivaApplies ? `IVA 포함 ${formatMoney(p.total, settings.currency)} ${per}` : null,
    formatKm(vehicle.mileage_km) ? `주행거리 ${formatKm(vehicle.mileage_km)}` : null,
  ].filter(Boolean);
  const description = `${settings.business_name} ${title} 렌탈 — ${parts.join(" · ")}. 정비·보험 포함 서비스와 렌트 시 제공 품목을 확인하세요.`;
  const cover = coverPhoto(vehicle);
  const images = [
    cover
      ? { url: photoUrl(cover), alt: title }
      : { url: `/og/${vehicle.slug}`, width: 1200, height: 630, alt: title },
  ];
  return {
    title: `${title} 렌탈`,
    description,
    alternates: { canonical: `/vehiculos/${vehicle.slug}` },
    openGraph: {
      type: "website",
      title: `${title} 렌탈 | ${settings.business_name}`,
      description,
      url: `/vehiculos/${vehicle.slug}`,
      images,
    },
    twitter: { card: "summary_large_image", title: `${title} 렌탈`, description, images },
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
      <VehicleDetail vehicle={vehicle} settings={settings} url={url} handover={handover} related={related} />
    </>
  );
}
