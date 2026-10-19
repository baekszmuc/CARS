import Link from "next/link";
import { CopyLinkButton } from "./CopyLinkButton";
import { WhatsAppButton } from "./WhatsAppButton";
import { serviceSummary } from "@/content/services";
import { ko } from "@/i18n/ko";
import { brandLabel, formatKm, formatMoney, priceBreakdown, specValue, vehicleTitle } from "@/lib/format";
import { vehicleUrl, type SiteBase } from "@/lib/site-url";
import { buildVehicleInquiryMessage } from "@/lib/whatsapp";
import type { Settings, Vehicle } from "@/lib/types";

interface Row {
  label: string;
  value: (v: Vehicle) => string;
  strong?: boolean;
  group: "price" | "basic" | "spec" | "service";
}

/** 비교표 사양 행 순서 — 이 목록에 없는 항목은 뒤에 추가된다. */
const SPEC_ORDER = ["엔진", "배기량", "출력", "토크", "변속기", "구동 방식", "연료", "승차 정원", "차체", "전장", "전폭", "전고", "축간거리"];

function specLabels(vehicles: Vehicle[]): string[] {
  const all = new Set<string>();
  vehicles.forEach((v) => (v.specs ?? []).forEach((s) => all.add(s.label)));
  return [...SPEC_ORDER.filter((l) => all.has(l)), ...[...all].filter((l) => !SPEC_ORDER.includes(l))];
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
  const unitOf = (v: Vehicle) => ko.billingUnit[v.billing_unit];
  const rows: Row[] = [
    { group: "price", label: "최종 렌트료 (IVA 포함)", strong: true, value: (v) => `${formatMoney(priceBreakdown(v).total, cur)} ${ko.billingUnitPer[v.billing_unit]}` },
    { group: "price", label: "기본 렌트료", value: (v) => `${formatMoney(priceBreakdown(v).base, cur)} ${ko.billingUnitPer[v.billing_unit]}` },
    { group: "price", label: "IVA", value: (v) => (v.iva_applies ? formatMoney(priceBreakdown(v).iva, cur) : ko.common.ivaNotApplied) },
    { group: "price", label: "과금 단위", value: (v) => `${unitOf(v)} 단위` },
    { group: "basic", label: "세부 모델", value: (v) => v.variant ?? ko.common.pending },
    { group: "basic", label: "연식", value: (v) => (v.model_year ? String(v.model_year) : ko.common.pending) },
    { group: "basic", label: "주행거리", value: (v) => formatKm(v.mileage_km) ?? ko.common.pending },
    { group: "basic", label: "상태", value: (v) => ko.vehicleStatus[v.status] },
    ...specLabels(vehicles).map<Row>((label) => ({
      group: "spec",
      label,
      value: (v) => specValue(v, label) ?? "—",
    })),
    { group: "service", label: "포함 서비스", value: () => `${serviceSummary.length}개 항목 모두 포함` },
  ];
  const groups: { key: Row["group"]; title: string }[] = [
    { key: "price", title: "가격" },
    { key: "basic", title: "차량 정보" },
    { key: "spec", title: "사양 (참고)" },
    { key: "service", title: "서비스" },
  ];

  const actions = (v: Vehicle) => {
    const url = vehicleUrl(base, v.slug);
    return (
      <div className="flex flex-col gap-2">
        <Link href={`/vehiculos/${v.slug}`} className="btn btn-primary btn-sm">상세 정보</Link>
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

  const head = (v: Vehicle, i: number) => (
    <>
      <span className="block text-[10px] font-bold tracking-[0.16em] text-steel">OPTION {String(i + 1).padStart(2, "0")}</span>
      <span className="mt-1 block text-base font-bold">
        {brandLabel(v) && <span className="font-medium text-graphite">{brandLabel(v)} </span>}
        {vehicleTitle(v)}
      </span>
    </>
  );

  return (
    <div>
      {/* 데스크톱: 표 */}
      <div className="hidden overflow-x-auto rounded-xl border border-silver md:block">
        <table className="w-full table-fixed border-collapse text-left text-sm" data-testid="comparison-table">
          <caption className="sr-only">차량 비교표</caption>
          <colgroup>
            <col className="w-48" />
            {vehicles.map((v) => <col key={v.id} />)}
          </colgroup>
          <thead>
            <tr className="border-b border-silver bg-white">
              <th scope="col" className="px-5 py-4 align-bottom text-xs font-semibold text-graphite">항목</th>
              {vehicles.map((v, i) => (
                <th key={v.id} scope="col" className="px-5 py-4 align-bottom">{head(v, i)}</th>
              ))}
            </tr>
          </thead>
          {groups.map((g) => {
            const list = rows.filter((r) => r.group === g.key);
            if (list.length === 0) return null;
            return (
              <tbody key={g.key}>
                <tr className="bg-mist">
                  <th scope="rowgroup" colSpan={vehicles.length + 1} className="px-5 py-2 text-[10px] font-bold tracking-[0.12em] text-steel">
                    {g.title}
                  </th>
                </tr>
                {list.map((r) => (
                  <tr key={r.label} className="border-t border-silver">
                    <th scope="row" className="px-5 py-3 font-medium text-graphite">{r.label}</th>
                    {vehicles.map((v) => (
                      <td key={v.id} className={`px-5 py-3 tabular-nums ${r.strong ? "text-lg font-bold" : "font-medium"}`}>
                        {r.value(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            );
          })}
          <tbody>
            <tr className="border-t border-silver">
              <th scope="row" className="px-5 py-4 font-medium text-graphite">바로가기</th>
              {vehicles.map((v) => (
                <td key={v.id} className="px-5 py-4 align-top">{actions(v)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 모바일: 카드 */}
      <div className="grid gap-4 md:hidden" data-testid="comparison-cards">
        {vehicles.map((v, i) => (
          <section key={v.id} className="overflow-hidden rounded-xl border border-silver" aria-label={vehicleTitle(v)}>
            <h3 className="border-b border-silver bg-white px-4 py-3">{head(v, i)}</h3>
            {groups.map((g) => {
              const list = rows.filter((r) => r.group === g.key);
              if (list.length === 0) return null;
              return (
                <div key={g.key}>
                  <p className="bg-mist px-4 py-1.5 text-[10px] font-bold tracking-[0.12em] text-steel">{g.title}</p>
                  <dl className="divide-y divide-silver text-sm">
                    {list.map((r) => (
                      <div key={r.label} className="flex justify-between gap-4 px-4 py-2.5">
                        <dt className="shrink-0 text-graphite">{r.label}</dt>
                        <dd className={`text-right tabular-nums ${r.strong ? "font-bold" : "font-medium"}`}>{r.value(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
            <div className="border-t border-silver p-4">{actions(v)}</div>
          </section>
        ))}
      </div>
      <p className="mt-3 text-xs text-graphite">
        사양은 공개 자료 기준 참고 정보이며 차량별로 확인이 필요합니다. &lsquo;—&rsquo; 는 확인된 정보가 없는 항목입니다.
        {!settings.whatsapp_number && ` ${ko.whatsappMissing}`}
      </p>
    </div>
  );
}
