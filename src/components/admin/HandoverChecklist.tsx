"use client";
import { useState, useTransition } from "react";
import { ko } from "@/i18n/ko";
import type { HandoverCategory, HandoverCheck, HandoverCheckStatus, HandoverItem } from "@/lib/types";
import { saveHandoverCheck } from "@/app/admin/(panel)/actions";
import { formatDateTime } from "@/lib/format";

const order: HandoverCategory[] = ["documents", "equipment", "keys"];
const statuses: HandoverCheckStatus[] = ["unchecked", "provided", "not_provided"];

/**
 * 차량별 실제 인도 체크리스트. 계약상 기본 제공 목록(handover_items)과 별도로 저장되며,
 * 기본값은 '미확인' — 직접 확인한 항목만 '제공 확인'으로 바꾼다.
 */
export function HandoverChecklist({
  vehicleId,
  items,
  checks,
}: {
  vehicleId: string;
  items: HandoverItem[];
  checks: HandoverCheck[];
}) {
  const [state, setState] = useState(() => new Map(checks.map((c) => [c.item_id, c])));
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const total = items.length;
  const provided = items.filter((i) => state.get(i.id)?.status === "provided").length;
  const notProvided = items.filter((i) => state.get(i.id)?.status === "not_provided").length;

  function save(item: HandoverItem, status: HandoverCheckStatus, note?: string) {
    const prev = state.get(item.id);
    const next: HandoverCheck = {
      vehicle_id: vehicleId,
      item_id: item.id,
      status,
      note: note ?? prev?.note ?? null,
      checked_at: status === "unchecked" ? null : new Date().toISOString(),
    };
    setState(new Map(state).set(item.id, next));
    start(async () => {
      setError(null);
      try {
        await saveHandoverCheck({ vehicle_id: vehicleId, item_id: item.id, status, note: next.note ?? undefined });
      } catch (e) {
        setError(e instanceof Error ? e.message : "저장 실패");
        setState((m) => {
          const copy = new Map(m);
          if (prev) copy.set(item.id, prev);
          else copy.delete(item.id);
          return copy;
        });
      }
    });
  }

  return (
    <div>
      <p className="text-sm" data-testid="handover-summary">
        제공 확인 <strong>{provided}</strong> / {total} · 제공 안 됨 <strong>{notProvided}</strong> · 미확인{" "}
        <strong>{total - provided - notProvided}</strong>
        {pending && <span className="ml-2 text-graphite">저장 중…</span>}
      </p>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="mt-4 grid gap-5 lg:grid-cols-3">
        {order.map((cat) => (
          <fieldset key={cat} className="rounded-lg border border-silver p-4">
            <legend className="px-1 text-sm font-bold">{ko.handoverCategory[cat]}</legend>
            <ul className="grid gap-3">
              {items
                .filter((i) => i.category === cat)
                .map((item) => {
                  const c = state.get(item.id);
                  const status = c?.status ?? "unchecked";
                  return (
                    <li key={item.id} className="text-sm" data-testid={`handover-${item.label}`}>
                      <p className="font-semibold">
                        {item.label}
                        {item.original_term && <span className="font-normal text-graphite"> ({item.original_term})</span>}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1" role="radiogroup" aria-label={`${item.label} 확인 상태`}>
                        {statuses.map((s) => (
                          <button
                            key={s}
                            type="button"
                            role="radio"
                            aria-checked={status === s}
                            onClick={() => status !== s && save(item, s)}
                            className={`rounded border px-2 py-1 text-xs font-semibold ${
                              status === s
                                ? s === "provided"
                                  ? "border-ok bg-[#e7f4ed] text-ok"
                                  : s === "not_provided"
                                    ? "border-danger bg-[#fdecea] text-danger"
                                    : "border-charcoal bg-silver text-charcoal"
                                : "border-silver bg-white text-graphite"
                            }`}
                          >
                            {ko.handoverCheckStatus[s]}
                          </button>
                        ))}
                      </div>
                      <input
                        className="field mt-1.5 min-h-0 py-1 text-xs"
                        placeholder="메모 (선택)"
                        aria-label={`${item.label} 메모`}
                        defaultValue={c?.note ?? ""}
                        maxLength={500}
                        onBlur={(e) => e.target.value !== (c?.note ?? "") && save(item, status, e.target.value)}
                      />
                      {c?.checked_at && <p className="mt-1 text-[10px] text-graphite">확인: {formatDateTime(c.checked_at)}</p>}
                    </li>
                  );
                })}
            </ul>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
