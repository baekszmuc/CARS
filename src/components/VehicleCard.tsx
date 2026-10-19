import Link from "next/link";
import { PriceBlock } from "./PriceBlock";
import { StatusBadge } from "./StatusBadge";
import { VehiclePhoto } from "./VehiclePhoto";
import { ko } from "@/i18n/ko";
import { coverPhoto } from "@/lib/data";
import { billingUnitLabel, formatKm, vehicleTitle } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

export function VehicleCard({ vehicle, currency }: { vehicle: Vehicle; currency: string }) {
  const title = vehicleTitle(vehicle);
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-silver bg-white" data-testid="vehicle-card">
      <VehiclePhoto photo={coverPhoto(vehicle)} label={title} className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold">{title}</h3>
          <StatusBadge status={vehicle.status} />
        </div>
        <dl className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <dt className="text-xs text-graphite">{ko.common.year}</dt>
            <dd className="font-semibold">{vehicle.model_year ?? ko.common.pending}</dd>
          </div>
          <div>
            <dt className="text-xs text-graphite">{ko.common.mileage}</dt>
            <dd className="font-semibold">{formatKm(vehicle.mileage_km) ?? ko.common.pending}</dd>
          </div>
          <div>
            <dt className="text-xs text-graphite">과금 단위</dt>
            <dd className="font-semibold">{billingUnitLabel(vehicle.billing_unit)} 렌트</dd>
          </div>
        </dl>
        <PriceBlock vehicle={vehicle} currency={currency} />
        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link href={`/vehiculos/${vehicle.slug}`} className="btn btn-primary btn-sm">
            {ko.common.details}
          </Link>
          <Link href={`/contacto?vehiculo=${vehicle.slug}`} className="btn btn-outline btn-sm">
            {ko.common.inquire}
          </Link>
        </div>
      </div>
    </article>
  );
}
