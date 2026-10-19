import { ko } from "@/i18n/ko";
import type { VehicleStatus } from "@/lib/types";

const styles: Record<VehicleStatus, string> = {
  available: "bg-[#e7f4ed] text-ok",
  reserved: "bg-[#fdf3e1] text-warn",
  rented: "bg-silver text-charcoal",
  maintenance: "bg-silver text-charcoal",
  unavailable: "bg-silver text-charcoal",
};

export function StatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {ko.vehicleStatus[status]}
    </span>
  );
}
