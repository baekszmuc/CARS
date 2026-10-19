"use client";
import { useFormAction } from "@/lib/use-form-action";
import { ko } from "@/i18n/ko";
import type { Settings } from "@/lib/types";
import { saveSettings, type FormState } from "@/app/admin/(panel)/actions";

const initial: FormState = { ok: false, errors: {} };

function Field({
  name, label, hint, defaultValue, error, type = "text", placeholder,
}: {
  name: string; label: string; hint?: string; defaultValue?: string | number | null; error?: string; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <input id={name} name={name} type={type} className="field" defaultValue={defaultValue ?? ""} placeholder={placeholder} />
      {hint && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useFormAction(saveSettings, initial);
  const e = state.errors;
  return (
    <form onSubmit={action} className="grid gap-8" data-testid="settings-form">
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-3 text-base font-bold">기본 정보</legend>
        <Field name="business_name" label="사업명 *" defaultValue={settings.business_name} error={e.business_name} />
        <Field name="site_domain" label="웹사이트 도메인 (실제 공개 주소)" defaultValue={settings.site_domain}
          placeholder="https://www.example.com" error={e.site_domain}
          hint="도메인 연결이 끝난 뒤에 입력하세요. 비어 있으면 임시 주소로 링크가 생성되고 검색 노출이 차단됩니다." />
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-3 text-base font-bold">연락처</legend>
        <Field name="whatsapp_number" label="WhatsApp 번호" defaultValue={settings.whatsapp_number}
          placeholder="595XXXXXXXXX" error={e.whatsapp_number}
          hint="국가번호(파라과이 595) 포함, 숫자만. 앞의 0과 + 기호는 빼고 입력하세요." />
        <Field name="phone" label="전화번호" defaultValue={settings.phone} error={e.phone} />
        <Field name="email" label="이메일" type="email" defaultValue={settings.email} error={e.email} />
        <Field name="instagram_url" label="Instagram URL" defaultValue={settings.instagram_url}
          placeholder="https://www.instagram.com/..." error={e.instagram_url} />
        <div className="sm:col-span-2">
          <Field name="address" label="주소" defaultValue={settings.address} error={e.address} />
        </div>
        <Field name="support_hours" label="전화 기술 지원 업무시간" defaultValue={settings.support_hours}
          error={e.support_hours} hint="예: 월–금 08:00–17:00, 토 08:00–12:00 (확인된 시간만 입력)" />
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-3 text-base font-bold">통화 및 IVA</legend>
        <Field name="currency" label="통화 코드" defaultValue={settings.currency} error={e.currency} hint="예: USD" />
        <Field name="default_iva_rate" label="기본 IVA 세율 (%)" defaultValue={Number(settings.default_iva_rate)}
          error={e.default_iva_rate} hint="새 차량 등록 시 기본값입니다. 기존 차량 세율은 차량별로 수정하세요." />
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" name="default_iva_applies" defaultChecked={settings.default_iva_applies} className="h-4 w-4" />
          새 차량에 IVA 기본 적용
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" name="iva_verified" defaultChecked={settings.iva_verified} className="h-4 w-4" />
          세무 담당자와 IVA 적용 여부·세율을 확인함
        </label>
        <p className="text-xs text-graphite sm:col-span-2">
          확인 전에는 차량 상세 페이지에 &ldquo;세금(IVA) 적용 방식은 계약 시 최종 확인됩니다&rdquo; 문구가 표시됩니다.
        </p>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-3 text-base font-bold">보험</legend>
        <div>
          <label htmlFor="insurance_status" className="field-label">보험 계약 상태</label>
          <select id="insurance_status" name="insurance_status" defaultValue={settings.insurance_status} className="field">
            {(Object.keys(ko.insuranceStatus) as (keyof typeof ko.insuranceStatus)[]).map((s) => (
              <option key={s} value={s}>{ko.insuranceStatus[s]}</option>
            ))}
          </select>
          <p className="field-hint">실제 보험 계약이 체결된 경우에만 &lsquo;가입 완료&rsquo;로 바꾸세요.</p>
        </div>
        <Field name="insurance_provider" label="보험사" defaultValue={settings.insurance_provider} error={e.insurance_provider} />
        <div className="sm:col-span-2">
          <label htmlFor="insurance_note" className="field-label">보험 안내 문구 (선택)</label>
          <textarea id="insurance_note" name="insurance_note" rows={2} className="field" defaultValue={settings.insurance_note ?? ""} maxLength={1000} />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-base font-bold">문의 안내 문구</legend>
        <textarea id="inquiry_notice" name="inquiry_notice" rows={3} className="field" defaultValue={settings.inquiry_notice ?? ""}
          maxLength={1000} aria-label="문의 안내 문구" placeholder="문의 페이지와 홈페이지 상담 섹션에 표시됩니다." />
      </fieldset>

      {state.message && (
        <p className={`text-sm font-semibold ${state.ok ? "text-ok" : "text-danger"}`} role="status" data-testid="form-message">{state.message}</p>
      )}
      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "저장 중…" : "설정 저장"}</button>
      </div>
    </form>
  );
}
