import type { BillingUnit, Vehicle } from "./types";
import { ko } from "@/i18n/ko";

/** Postgres numeric 값은 문자열로 올 수 있으므로 항상 숫자로 정규화한다. */
export function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** 예: formatMoney(1100, "USD") → "USD 1,100" / formatMoney(80.5) → "USD 80.50" */
export function formatMoney(value: number | string, currency = "USD"): string {
  const n = toNumber(value);
  const hasCents = Math.round(n * 100) % 100 !== 0;
  const body = n.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${currency} ${body}`;
}

export function formatKm(value: number | null): string | null {
  if (value === null || value === undefined) return null;
  return `${value.toLocaleString("en-US")} km`;
}

export function billingUnitLabel(unit: BillingUnit): string {
  return ko.billingUnit[unit];
}

/** 차량 표시명: 연식이 있으면 "Tivoli 2023", 없으면 "Kia Seltos" */
export function vehicleTitle(v: Pick<Vehicle, "name" | "model_year">): string {
  return v.model_year ? `${v.name} ${v.model_year}` : v.name;
}

/** 차량명에 제조사가 이미 포함되어 있으면 null (예: "Kia Seltos") */
export function brandLabel(v: Pick<Vehicle, "name" | "brand">): string | null {
  if (!v.brand) return null;
  return v.name.toLowerCase().startsWith(v.brand.toLowerCase()) ? null : v.brand;
}

export function specValue(v: Pick<Vehicle, "specs">, label: string): string | null {
  return v.specs?.find((s) => s.label === label)?.value ?? null;
}

export interface PriceBreakdown {
  base: number;
  iva: number;
  total: number;
  ivaApplies: boolean;
  ivaRate: number;
  unit: BillingUnit;
}

export function priceBreakdown(v: Vehicle): PriceBreakdown {
  return {
    base: toNumber(v.base_price),
    iva: toNumber(v.iva_amount),
    total: toNumber(v.total_price),
    ivaApplies: v.iva_applies,
    ivaRate: toNumber(v.iva_rate),
    unit: v.billing_unit,
  };
}

export function formatDate(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Asuncion",
  });
}
