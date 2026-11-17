import { Gauge } from "./Gauge";
import { VehiclePhoto } from "./VehiclePhoto";
import { ko } from "@/i18n/ko";
import { sortPhotos } from "@/lib/data";
import { powerOf, specValue, vehicleTitle } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

const short = (v: string | null) => (v ? v.replace(/\s*\(.*\)\s*/g, "").split(" · ")[0] : null);

/**
 * 레퍼런스의 "개요" 구성: 왼쪽은 출력 게이지, 오른쪽은 차량 사진과 상태.
 * 게이지는 보유 차량 중 가장 높은 출력을 가득 찬 값으로 본다.
 */
export function VehicleOverview({ vehicle, maxHp }: { vehicle: Vehicle; maxHp: number }) {
  const power = powerOf(vehicle);
  const photos = sortPhotos(vehicle.vehicle_photos);
  const side = photos[1] ?? photos[0] ?? null;
  const caption = (label: string, value: string) => (
    <div className="mt-4 text-center">
      <p className="text-xs text-graphite">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
  return (
    <div className="grid gap-12 sm:grid-cols-2 sm:gap-8">
      <div className="flex flex-col items-center">
        <h3 className="text-base font-normal">{power ? "출력" : "엔진"}</h3>
        <div className="mt-6 w-full">
          {power ? (
            <Gauge value={power.value.toLocaleString("en-US")} unit={power.unit} fraction={maxHp > 0 ? power.hp / maxHp : 0} label="출력" />
          ) : (
            <p className="py-16 text-center text-sm">{short(specValue(vehicle, "엔진")) ?? ko.common.pending}</p>
          )}
        </div>
        {caption("최대토크", short(specValue(vehicle, "토크")) ?? ko.common.pending)}
      </div>
      <div className="flex flex-col items-center">
        <h3 className="text-base font-normal">차량 상태</h3>
        <VehiclePhoto photo={side} label={vehicleTitle(vehicle)} className="mt-6 aspect-[4/3] w-full max-w-[17rem]" sizes="280px" />
        {caption("상태", ko.vehicleStatus[vehicle.status])}
      </div>
    </div>
  );
}

export function maxHpOf(vehicles: Pick<Vehicle, "specs">[]): number {
  return Math.max(0, ...vehicles.map((v) => powerOf(v)?.hp ?? 0));
}
