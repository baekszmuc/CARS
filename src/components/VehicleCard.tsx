import Link from "next/link";
import { PriceBlock } from "./PriceBlock";
import { StatusBadge } from "./StatusBadge";
import { VehiclePhoto } from "./VehiclePhoto";
import { ko } from "@/i18n/ko";
import { coverPhoto } from "@/lib/data";
import { brandLabel, formatKm, specValue, vehicleTitle } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

/** 카드에 요약 표시할 사양 (있는 것만) */
const CARD_SPECS = ["엔진", "변속기", "연료"];

export function VehicleCard({
  vehicle,
  currency,
  index,
}: {
  vehicle: Vehicle;
  currency: string;
  index?: number;
}) {
  const title = vehicleTitle(vehicle);
  const brand = brandLabel(vehicle);
  const specs = CARD_SPECS.map((l) => [l, specValue(vehicle, l)] as const).filter(([, v]) => v);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-silver bg-white" data-testid="vehicle-card">
      <Link href={`/vehiculos/${vehicle.slug}`} tabIndex={-1} aria-hidden="true">
        <VehiclePhoto photo={coverPhoto(vehicle)} label={title} className="aspect-[16/10]" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold tracking-[0.16em] text-steel">
            {index !== undefined ? `OPTION ${String(index + 1).padStart(2, "0")}` : brand?.toUpperCase()}
          </p>
          <StatusBadge status={vehicle.status} />
        </div>
        <h3 className="mt-2 text-xl font-bold tracking-tight">
          {brand && <span className="font-medium text-graphite">{brand} </span>}
          {title}
        </h3>
        {vehicle.variant && <p className="mt-0.5 text-sm text-graphite">{vehicle.variant}</p>}

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-silver py-3 text-[13px]">
          <div>
            <dt className="text-graphite">{ko.common.year}</dt>
            <dd className="font-semibold">{vehicle.model_year ?? ko.common.pending}</dd>
          </div>
          <div>
            <dt className="text-graphite">{ko.common.mileage}</dt>
            <dd className="font-semibold">{formatKm(vehicle.mileage_km) ?? ko.common.pending}</dd>
          </div>
          {specs.map(([label, value]) => (
            <div key={label} className="col-span-2">
              <dt className="sr-only">{label}</dt>
              <dd className="truncate text-charcoal" title={`${label}: ${value}`}>
                <span className="text-graphite">{label}</span> · {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex-1">
          <PriceBlock vehicle={vehicle} currency={currency} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`/vehiculos/${vehicle.slug}`} className="btn btn-primary btn-sm">상세 정보</Link>
          <Link href={`/contacto?vehiculo=${vehicle.slug}`} className="btn btn-outline btn-sm">{ko.common.inquire}</Link>
        </div>
      </div>
    </article>
  );
}
