"use server";
import { createPublicClient } from "@/lib/supabase/public";
import { flattenErrors, inquirySchema, type FieldErrors } from "@/lib/validation";

export interface InquiryState {
  ok: boolean;
  errors: FieldErrors;
  message?: string;
}

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // 스팸 방지용 숨김 필드 — 사람이 입력하지 않는 칸에 값이 있으면 저장하지 않는다.
  if (String(formData.get("website") ?? "") !== "") {
    return { ok: true, errors: {} };
  }

  const raw = Object.fromEntries(
    ["name", "phone", "email", "vehicle_id", "pickup_date", "return_date", "message", "consent"].map((k) => [
      k,
      formData.get(k) === null ? undefined : String(formData.get(k)),
    ]),
  );
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errors: flattenErrors(parsed.error), message: "입력 내용을 확인해 주세요." };
  }

  const { consent: _consent, ...row } = parsed.data;
  void _consent;
  const { error } = await createPublicClient().from("inquiries").insert(row);
  if (error) {
    console.error("inquiry insert failed", error);
    return {
      ok: false,
      errors: {},
      message: "문의를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
  return { ok: true, errors: {} };
}
