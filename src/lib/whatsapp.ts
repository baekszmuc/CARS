import type { Settings, Vehicle } from "./types";
import { billingUnitLabel, formatMoney, priceBreakdown, vehicleTitle } from "./format";

/** 국제 형식 숫자만 허용 (예: 595981123456). 유효하지 않으면 null. */
export function normalizeWhatsappNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^0-9]/g, "");
  return /^[0-9]{8,15}$/.test(digits) ? digits : null;
}

export function buildVehicleInquiryMessage(
  vehicle: Vehicle,
  settings: Pick<Settings, "business_name" | "currency">,
  url: string,
): string {
  const p = priceBreakdown(vehicle);
  const unit = billingUnitLabel(p.unit);
  const cur = settings.currency || "USD";
  const lines = [
    `안녕하세요. ${settings.business_name} 차량 렌탈에 대해 문의드립니다.`,
    `관심 차량: ${vehicleTitle(vehicle)}`,
  ];
  if (p.ivaApplies) {
    lines.push(`${unit} 렌트료: ${formatMoney(p.base, cur)} + IVA`);
    lines.push(`IVA 포함 가격: ${formatMoney(p.total, cur)}`);
  } else {
    lines.push(`${unit} 렌트료: ${formatMoney(p.base, cur)}`);
  }
  lines.push("차량의 이용 가능 여부와 렌탈 조건을 안내해 주실 수 있을까요?");
  lines.push(`차량 상세 링크: ${url}`);
  return lines.join("\n");
}

export function buildGeneralInquiryMessage(settings: Pick<Settings, "business_name">): string {
  return `안녕하세요. ${settings.business_name} 차량 렌탈에 대해 문의드립니다.`;
}

/** 번호가 없거나 잘못되었으면 null을 반환한다. 잘못된 링크는 절대 만들지 않는다. */
export function whatsappLink(number: string | null | undefined, message: string): string | null {
  const n = normalizeWhatsappNumber(number);
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

/** 수신 번호 없이 메시지만 공유 (차량 링크 공유용) */
export function whatsappShareLink(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
