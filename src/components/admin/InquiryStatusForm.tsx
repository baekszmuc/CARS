"use client";
import { useFormAction } from "@/lib/use-form-action";
import { ko } from "@/i18n/ko";
import type { Inquiry } from "@/lib/types";
import { updateInquiry, type FormState } from "@/app/admin/(panel)/actions";

const initial: FormState = { ok: false, errors: {} };

export function InquiryStatusForm({ inquiry }: { inquiry: Inquiry }) {
  const [state, action, pending] = useFormAction(updateInquiry, initial);
  return (
    <form onSubmit={action} className="grid gap-2" data-testid={`inquiry-form-${inquiry.id}`}>
      <input type="hidden" name="id" value={inquiry.id} />
      <label className="sr-only" htmlFor={`status-${inquiry.id}`}>상태</label>
      <select id={`status-${inquiry.id}`} name="status" defaultValue={inquiry.status} className="field text-sm">
        {(Object.keys(ko.inquiryStatus) as (keyof typeof ko.inquiryStatus)[]).map((s) => (
          <option key={s} value={s}>{ko.inquiryStatus[s]}</option>
        ))}
      </select>
      <label className="sr-only" htmlFor={`note-${inquiry.id}`}>관리자 메모</label>
      <textarea id={`note-${inquiry.id}`} name="admin_note" rows={2} defaultValue={inquiry.admin_note ?? ""}
        placeholder="관리자 메모 (고객에게 보이지 않음)" className="field text-sm" maxLength={2000} />
      <div className="flex items-center gap-2">
        <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>{pending ? "저장 중…" : "저장"}</button>
        {state.message && (
          <span className={`text-xs ${state.ok ? "text-ok" : "text-danger"}`} role="status">{state.message}</span>
        )}
      </div>
    </form>
  );
}
