"use client";
import { useFormAction } from "@/lib/use-form-action";
import Link from "next/link";
import { submitInquiry, type InquiryState } from "./actions";
import { ko } from "@/i18n/ko";

interface Option {
  id: string;
  slug: string;
  label: string;
}

const initial: InquiryState = { ok: false, errors: {} };

function Err({ msg, id }: { msg?: string; id: string }) {
  return msg ? (
    <p className="field-error" id={id} role="alert">
      {msg}
    </p>
  ) : null;
}

export function InquiryForm({ vehicles, selectedSlug }: { vehicles: Option[]; selectedSlug?: string }) {
  const [state, action, pending] = useFormAction(submitInquiry, initial);
  const selected = vehicles.find((v) => v.slug === selectedSlug)?.id ?? "";
  const e = state.errors;

  if (state.ok) {
    return (
      <div className="rounded-lg border border-silver bg-mist p-6" role="status" data-testid="inquiry-success">
        <h2 className="text-lg font-bold">문의가 접수되었습니다.</h2>
        <p className="mt-2 text-sm leading-relaxed text-charcoal">
          담당자가 내용을 확인한 뒤 남겨 주신 연락처로 안내드립니다. {ko.availabilityNotice}
        </p>
        <Link href="/vehiculos" className="btn btn-outline btn-sm mt-4">
          차량 목록으로
        </Link>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={action} className="grid gap-5" noValidate data-testid="inquiry-form">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">이름 *</label>
          <input id="name" name="name" className="field" autoComplete="name" required maxLength={100}
            aria-invalid={!!e.name} aria-describedby={e.name ? "name-err" : undefined} />
          <Err msg={e.name} id="name-err" />
        </div>
        <div>
          <label htmlFor="phone" className="field-label">전화번호 *</label>
          <input id="phone" name="phone" type="tel" className="field" autoComplete="tel" required maxLength={40}
            inputMode="tel" placeholder="+595 ..." aria-invalid={!!e.phone}
            aria-describedby={e.phone ? "phone-err" : undefined} />
          <Err msg={e.phone} id="phone-err" />
        </div>
        <div>
          <label htmlFor="email" className="field-label">이메일 (선택)</label>
          <input id="email" name="email" type="email" className="field" autoComplete="email" maxLength={120}
            aria-invalid={!!e.email} aria-describedby={e.email ? "email-err" : undefined} />
          <Err msg={e.email} id="email-err" />
        </div>
        <div>
          <label htmlFor="vehicle_id" className="field-label">관심 차량</label>
          <select id="vehicle_id" name="vehicle_id" className="field" defaultValue={selected}>
            <option value="">아직 정하지 않았습니다</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
          <Err msg={e.vehicle_id} id="vehicle-err" />
        </div>
        <div>
          <label htmlFor="pickup_date" className="field-label">희망 인수일</label>
          <input id="pickup_date" name="pickup_date" type="date" className="field" min={today} />
          <Err msg={e.pickup_date} id="pickup-err" />
        </div>
        <div>
          <label htmlFor="return_date" className="field-label">희망 반납일</label>
          <input id="return_date" name="return_date" type="date" className="field" min={today}
            aria-invalid={!!e.return_date} aria-describedby={e.return_date ? "return-err" : undefined} />
          <Err msg={e.return_date} id="return-err" />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="field-label">추가 문의사항</label>
        <textarea id="message" name="message" rows={5} className="field" maxLength={2000} />
        <Err msg={e.message} id="message-err" />
      </div>
      {/* 스팸 방지용 숨김 필드 */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">웹사이트</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="consent" className="mt-1 h-4 w-4" required />
          <span>
            문의 응대를 위한 개인정보 수집·이용에 동의합니다.{" "}
            <Link href="/privacidad" className="underline" target="_blank">개인정보 처리방침</Link>
          </span>
        </label>
        <Err msg={e.consent} id="consent-err" />
      </div>
      <p className="rounded-md bg-mist px-4 py-3 text-sm text-charcoal">{ko.availabilityNotice}</p>
      {state.message && !state.ok && (
        <p className="text-sm font-semibold text-danger" role="alert">{state.message}</p>
      )}
      <div>
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>
          {pending ? "전송 중…" : "문의 보내기"}
        </button>
      </div>
    </form>
  );
}
