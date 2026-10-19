import Link from "next/link";
import { PriceBlock } from "./PriceBlock";
import { StatusBadge } from "./StatusBadge";
import { VehiclePhoto } from "./VehiclePhoto";
import { ko } from "@/i18n/ko";
import { coverPhoto } from "@/lib/data";
import { brandLabel, formatKm, specValue, vehicleTitle } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

/** 카드 사양 줄: 짧은 값만 (괄호 안 설명은 상세 페이지에서) */
function short(value: string | null): string | null {
  return value ? value.replace(/\s*\(.*\)\s*/g, "").split(" · ")[0] : null;
}

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
  const facts = [
    vehicle.model_year ? String(vehicle.model_year) : null,
    formatKm(vehicle.mileage_km),
    short(specValue(vehicle, "변속기")),
    short(specValue(vehicle, "연료")),
  ].filter(Boolean) as string[];

  return (
    <article className="group flex h-full flex-col bg-white" data-testid="vehicle-card">
      <Link href={`/vehiculos/${vehicle.slug}`} tabIndex={-1} aria-hidden="true" className="block overflow-hidden">
        <VehiclePhoto
          photo={coverPhoto(vehicle)}
          label={title}
          className="aspect-[4/3] bg-tile transition-transform duration-300 group-hover:scale-[1.015] motion-reduce:transition-none"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-medium tracking-[0.16em] text-steel">
            {index !== undefined ? `OPTION ${String(index + 1).padStart(2, "0")}` : brand?.toUpperCase()}
          </p>
          <StatusBadge status={vehicle.status} />
        </div>
        <h3 className="mt-1.5 text-lg font-medium tracking-tight">
          {brand && <span className="text-graphite">{brand} </span>}
          {title}
        </h3>
        {vehicle.variant && <p className="text-xs text-graphite">{vehicle.variant}</p>}
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-charcoal" aria-label="주요 정보">
          {facts.map((f, i) => (
            <span key={f} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true" className="h-3 w-px bg-silver" />}
              {f}
            </span>
          ))}
        </p>
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
