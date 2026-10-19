import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max}자 이내로 입력해 주세요.`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

const isoDate = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional()
  .transform((v) => v ?? null)
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "날짜 형식이 올바르지 않습니다.");

export const inquirySchema = z
  .object({
    name: z.string().trim().min(1, "이름을 입력해 주세요.").max(100, "100자 이내로 입력해 주세요."),
    phone: z
      .string()
      .trim()
      .min(5, "전화번호를 입력해 주세요.")
      .max(40, "전화번호가 너무 깁니다.")
      .regex(/^[0-9+()\-\s]+$/, "전화번호는 숫자와 + ( ) - 만 사용할 수 있습니다."),
    email: optionalText(120).refine(
      (v) => v === null || z.string().email().safeParse(v).success,
      "이메일 형식이 올바르지 않습니다.",
    ),
    vehicle_id: z
      .string()
      .trim()
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .optional()
      .transform((v) => v ?? null)
      .refine((v) => v === null || z.string().uuid().safeParse(v).success, "차량 선택이 올바르지 않습니다."),
    pickup_date: isoDate,
    return_date: isoDate,
    message: optionalText(2000),
    consent: z.literal("on", { message: "개인정보 수집·이용에 동의해 주세요." }),
  })
  .refine((d) => !d.pickup_date || !d.return_date || d.return_date >= d.pickup_date, {
    path: ["return_date"],
    message: "희망 반납일은 희망 인수일 이후여야 합니다.",
  });

export type FieldErrors = Partial<Record<string, string>>;

export function flattenErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

// ── 관리자 입력 ───────────────────────────────────────────────────────────
const num = (label: string, opts: { min?: number; max?: number; int?: boolean } = {}) =>
  z
    .string()
    .trim()
    .min(1, `${label}을(를) 입력해 주세요.`)
    .transform((v) => v.replace(/,/g, ""))
    .refine((v) => /^-?\d+(\.\d{1,2})?$/.test(v), `${label}은(는) 숫자로 입력해 주세요 (소수점 2자리까지).`)
    .transform(Number)
    .refine((n) => opts.min === undefined || n >= opts.min, `${label}은(는) ${opts.min} 이상이어야 합니다.`)
    .refine((n) => opts.max === undefined || n <= opts.max, `${label}은(는) ${opts.max} 이하여야 합니다.`)
    .refine((n) => !opts.int || Number.isInteger(n), `${label}은(는) 정수로 입력해 주세요.`);

const optionalNum = (label: string, opts: { min?: number; max?: number; int?: boolean } = {}) =>
  z.union([z.literal("").transform(() => null), num(label, opts)]).optional().transform((v) => v ?? null);

export const vehicleSchema = z.object({
  name: z.string().trim().min(1, "차량명을 입력해 주세요.").max(80),
  model_year: optionalNum("연식", { min: 1950, max: 2100, int: true }),
  mileage_km: optionalNum("주행거리", { min: 0, max: 5_000_000, int: true }),
  base_price: num("기본 렌트료", { min: 0, max: 10_000_000 }),
  iva_applies: z.boolean(),
  iva_rate: num("IVA 세율", { min: 0, max: 100 }),
  billing_unit: z.enum(["day", "week", "month", "year"]),
  status: z.enum(["available", "reserved", "rented", "maintenance", "unavailable"]),
  description: optionalText(4000),
  sort_order: optionalNum("정렬 순서", { min: -100000, max: 100000, int: true }).transform((v) => v ?? 0),
  is_published: z.boolean(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80)
    .refine((v) => v === "" || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v), "URL 주소는 영문 소문자, 숫자, - 만 사용할 수 있습니다.")
    .optional()
    .transform((v) => v ?? ""),
});

export const settingsSchema = z.object({
  business_name: z.string().trim().min(1, "사업명을 입력해 주세요.").max(80),
  whatsapp_number: optionalText(30)
    .transform((v) => (v ? v.replace(/[^0-9]/g, "") : null))
    .refine(
      (v) => v === null || /^[0-9]{8,15}$/.test(v),
      "WhatsApp 번호는 국가번호를 포함한 8~15자리 숫자로 입력해 주세요 (예: 595 981 000000).",
    ),
  phone: optionalText(40),
  email: optionalText(120).refine(
    (v) => v === null || z.string().email().safeParse(v).success,
    "이메일 형식이 올바르지 않습니다.",
  ),
  address: optionalText(300),
  instagram_url: optionalText(200).refine(
    (v) => v === null || /^https:\/\/(www\.)?instagram\.com\/.+/.test(v),
    "Instagram 주소는 https://www.instagram.com/... 형식으로 입력해 주세요.",
  ),
  site_domain: optionalText(200)
    .transform((v) => (v ? v.replace(/\/+$/, "") : null))
    .refine(
      (v) => v === null || /^https?:\/\/[^/\s]+$/.test(v),
      "도메인은 https://example.com 형식으로 입력해 주세요 (경로 없이).",
    ),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "통화는 3자리 코드로 입력해 주세요 (예: USD, PYG)."),
  default_iva_rate: num("기본 IVA 세율", { min: 0, max: 100 }),
  default_iva_applies: z.boolean(),
  iva_verified: z.boolean(),
  inquiry_notice: optionalText(1000),
  support_hours: optionalText(200),
  insurance_status: z.enum(["not_set", "proposal", "active"]),
  insurance_provider: optionalText(120),
  insurance_note: optionalText(1000),
});
