import { ko } from "@/i18n/ko";
import { formatMoney, priceBreakdown } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

/**
 * 최종 금액(IVA 포함)을 가장 크게, 그 아래 기본 렌트료와 IVA를 나누어 표시한다.
 * 표기 단위(월/주/일/연)는 차량의 과금 단위를 따른다.
 */
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
  const unit = ko.billingUnit[p.unit];
  const per = ko.billingUnitPer[p.unit];
  const big = size === "lg";
  return (
    <div className={`rounded-lg bg-mist ${big ? "p-5" : "p-4"}`}>
      <p className="text-xs font-semibold text-graphite">
        최종 {unit} 렌트료{p.ivaApplies ? " · IVA 포함" : ""}
      </p>
      <p className={`mt-1 tabular-nums ${big ? "price-final sm:text-4xl" : "price-final"}`} data-testid="price-total">
        {formatMoney(p.total, currency)} <span className="text-sm font-medium text-graphite">{per}</span>
      </p>
      <dl className={`mt-3 grid gap-1 border-t border-silver pt-3 ${big ? "text-sm" : "text-[13px]"}`}>
        <div className="flex justify-between gap-3">
          <dt className="text-graphite">기본 {unit} 렌트료</dt>
          <dd className="font-semibold tabular-nums" data-testid="price-base">
            {formatMoney(p.base, currency)} <span className="font-normal text-graphite">{per}</span>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-graphite">
            {ko.common.iva}
            {p.ivaApplies && <span className="ml-1">({p.ivaRate}%)</span>}
          </dt>
          <dd className="font-semibold tabular-nums" data-testid="price-iva">
            {p.ivaApplies ? formatMoney(p.iva, currency) : ko.common.ivaNotApplied}
          </dd>
        </div>
      </dl>
    </div>
  );
}
