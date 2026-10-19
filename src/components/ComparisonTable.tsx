import Link from "next/link";
import { CopyLinkButton } from "./CopyLinkButton";
import { WhatsAppButton } from "./WhatsAppButton";
import { ko } from "@/i18n/ko";
import { formatKm, formatMoney, priceBreakdown, billingUnitLabel, vehicleTitle } from "@/lib/format";
import { vehicleUrl, type SiteBase } from "@/lib/site-url";
import { buildVehicleInquiryMessage } from "@/lib/whatsapp";
import type { Settings, Vehicle } from "@/lib/types";

interface Row {
  label: string;
  value: (v: Vehicle) => string;
}

export function ComparisonTable({
  vehicles,
  settings,
  base,
}: {
  vehicles: Vehicle[];
  settings: Settings;
  base: SiteBase;
}) {
  const cur = settings.currency;
  const rows: Row[] = [
    { label: "차량 연식", value: (v) => (v.model_year ? String(v.model_year) : ko.common.pending) },
    { label: "주행거리", value: (v) => formatKm(v.mileage_km) ?? ko.common.pending },
    { label: "과금 단위", value: (v) => `${billingUnitLabel(v.billing_unit)} 렌트` },
    {
      label: "기본 렌트료",
      value: (v) => formatMoney(priceBreakdown(v).base, cur),
    },
    {
      label: "IVA",
      value: (v) => (v.iva_applies ? formatMoney(priceBreakdown(v).iva, cur) : ko.common.ivaNotApplied),
    },
    { label: "IVA 포함 렌트료", value: (v) => formatMoney(priceBreakdown(v).total, cur) },
    { label: "상태", value: (v) => ko.vehicleStatus[v.status] },
  ];

  const actions = (v: Vehicle) => {
    const url = vehicleUrl(base, v.slug);
    return (
      <div className="flex flex-col gap-2">
        <Link href={`/vehiculos/${v.slug}`} className="btn btn-primary btn-sm">
          차량 상세 정보
        </Link>
        <CopyLinkButton url={url} />
        <WhatsAppButton
          number={settings.whatsapp_number}
          message={buildVehicleInquiryMessage(v, settings, url)}
          className="btn btn-outline btn-sm"
          showMissingNotice={false}
        />
      </div>
    );
  };

  return (
    <div>
      {/* 데스크톱: 표 */}
      <div className="hidden overflow-x-auto rounded-lg border border-silver md:block">
        <table className="w-full border-collapse text-left text-sm" data-testid="comparison-table">
          <caption className="sr-only">차량 비교표</caption>
          <thead className="bg-obsidian text-white">
            <tr>
              <th scope="col" className="w-44 px-5 py-4 font-semibold">항목</th>
              {vehicles.map((v) => (
                <th key={v.id} scope="col" className="px-5 py-4 text-base font-bold">
                  {vehicleTitle(v)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-silver even:bg-mist">
                <th scope="row" className="px-5 py-3.5 font-medium text-graphite">
                  {r.label}
                </th>
                {vehicles.map((v) => (
                  <td key={v.id} className="px-5 py-3.5 font-semibold tabular-nums">
                    {r.value(v)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-silver">
              <th scope="row" className="px-5 py-4 font-medium text-graphite">바로가기</th>
              {vehicles.map((v) => (
                <td key={v.id} className="px-5 py-4 align-top">
                  {actions(v)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 모바일: 카드 */}
      <div className="grid gap-4 md:hidden" data-testid="comparison-cards">
        {vehicles.map((v) => (
          <section key={v.id} className="rounded-lg border border-silver" aria-label={vehicleTitle(v)}>
            <h3 className="rounded-t-lg bg-obsidian px-4 py-3 text-lg font-bold text-white">{vehicleTitle(v)}</h3>
            <dl className="divide-y divide-silver text-sm">
              {rows.map((r) => (
                <div key={r.label} className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="text-graphite">{r.label}</dt>
                  <dd className="text-right font-semibold tabular-nums">{r.value(v)}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-silver p-4">{actions(v)}</div>
          </section>
        ))}
      </div>
      {!settings.whatsapp_number && (
        <p className="mt-3 text-sm text-graphite">{ko.whatsappMissing}</p>
      )}
    </div>
  );
}
