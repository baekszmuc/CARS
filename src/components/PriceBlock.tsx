import { ko } from "@/i18n/ko";
import { formatMoney, priceBreakdown } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

/** 기본 렌트료 / IVA / IVA 포함 최종 금액을 항상 같은 형식으로 표시한다. */
export function PriceBlock({
  vehicle,
  currency,
  size = "md",
}: {
  vehicle: Vehicle;
  currency: string;
  size?: "md" | "lg";
}) {
  const p = priceBreakdown(vehicle);
  const per = ko.billingUnitPer[p.unit];
  const big = size === "lg";
  return (
    <dl className={`divide-y divide-silver rounded-md border border-silver ${big ? "text-base" : "text-sm"}`}>
      <div className="flex items-baseline justify-between gap-3 px-4 py-2.5">
        <dt className="text-graphite">{ko.common.base}</dt>
        <dd className="font-semibold tabular-nums" data-testid="price-base">
          {formatMoney(p.base, currency)} <span className="font-normal text-graphite">{per}</span>
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-3 px-4 py-2.5">
        <dt className="text-graphite">
          {ko.common.iva}
          {p.ivaApplies && <span className="ml-1 text-xs">({p.ivaRate}%)</span>}
        </dt>
        <dd className="font-semibold tabular-nums" data-testid="price-iva">
          {p.ivaApplies ? formatMoney(p.iva, currency) : ko.common.ivaNotApplied}
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-3 bg-mist px-4 py-3">
        <dt className="font-semibold">{ko.common.withIva}</dt>
        <dd className={`font-bold tabular-nums ${big ? "text-2xl" : "text-lg"}`} data-testid="price-total">
          {formatMoney(p.total, currency)} <span className="text-sm font-normal text-graphite">{per}</span>
        </dd>
      </div>
    </dl>
  );
}
