"use client";
import { useFormAction } from "@/lib/use-form-action";
import { useState } from "react";
import type { FormState } from "@/app/admin/(panel)/actions";
import { ko } from "@/i18n/ko";
import { formatMoney } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

const initial: FormState = { ok: false, errors: {} };

/** DB의 public.slugify 와 같은 규칙 (미리보기용 — 최종 값은 DB가 결정) */
function previewSlug(name: string, year: string) {
  return `${name} ${year}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="field-error" role="alert">{msg}</p> : null;
}

export function VehicleForm({
  action,
  vehicle,
  defaults,
  siteUrl,
  currency,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  vehicle?: Vehicle;
  defaults: { iva_rate: number; iva_applies: boolean };
  siteUrl: string;
  currency: string;
}) {
  const [state, formAction, pending] = useFormAction(action, initial);
  const [name, setName] = useState(vehicle?.name ?? "");
  const [year, setYear] = useState(vehicle?.model_year?.toString() ?? "");
  const [base, setBase] = useState(vehicle ? String(Number(vehicle.base_price)) : "");
  const [rate, setRate] = useState(String(Number(vehicle?.iva_rate ?? defaults.iva_rate)));
  const [applies, setApplies] = useState(vehicle?.iva_applies ?? defaults.iva_applies);
  const [unit, setUnit] = useState<Vehicle["billing_unit"]>(vehicle?.billing_unit ?? "month");
  const [slug, setSlug] = useState(vehicle?.slug ?? "");
  const e = state.errors;

  const baseN = Number(base.replace(/,/g, ""));
  const rateN = Number(rate);
  const valid = Number.isFinite(baseN) && Number.isFinite(rateN) && base !== "";
  const iva = valid && applies ? Math.round(baseN * rateN) / 100 : 0;
  const total = valid ? Math.round((baseN + iva) * 100) / 100 : 0;
  const autoSlug = previewSlug(name, year) || "vehiculo";

  return (
    <form onSubmit={formAction} className="grid gap-6" data-testid="vehicle-form">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="field-label">차량명 *</label>
          <input id="name" name="name" className="field" required maxLength={80} value={name} onChange={(ev) => setName(ev.target.value)} />
          <p className="field-hint">확인된 이름만 입력하세요. 제조사·세부 모델을 추정해 넣지 마세요.</p>
          <Err msg={e.name} />
        </div>
        <div>
          <label htmlFor="brand" className="field-label">제조사</label>
          <input id="brand" name="brand" className="field" maxLength={60} defaultValue={vehicle?.brand ?? ""} placeholder="확인된 경우에만 입력" />
          <Err msg={e.brand} />
        </div>
        <div>
          <label htmlFor="variant" className="field-label">세부 모델 / 트림</label>
          <input id="variant" name="variant" className="field" maxLength={120} defaultValue={vehicle?.variant ?? ""} placeholder="예: 1.6 Turbo HEV" />
          <Err msg={e.variant} />
        </div>
        <div>
          <label htmlFor="model_year" className="field-label">연식</label>
          <input id="model_year" name="model_year" className="field" inputMode="numeric" value={year} onChange={(ev) => setYear(ev.target.value)} placeholder="미확인 시 비워 두기" />
          <Err msg={e.model_year} />
        </div>
        <div>
          <label htmlFor="mileage_km" className="field-label">주행거리 (km)</label>
          <input id="mileage_km" name="mileage_km" className="field" inputMode="numeric" defaultValue={vehicle?.mileage_km ?? ""} placeholder="미확인 시 비워 두기" />
          <Err msg={e.mileage_km} />
        </div>
      </div>

      <fieldset className="grid gap-5 rounded-lg border border-silver p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-bold">렌트료 및 IVA</legend>
        <div>
          <label htmlFor="base_price" className="field-label">기본 렌트료 (IVA 별도, {currency}) *</label>
          <input id="base_price" name="base_price" className="field" inputMode="decimal" required value={base} onChange={(ev) => setBase(ev.target.value)} />
          <Err msg={e.base_price} />
        </div>
        <div>
          <label htmlFor="billing_unit" className="field-label">과금 단위 *</label>
          <select id="billing_unit" name="billing_unit" className="field" value={unit} onChange={(ev) => setUnit(ev.target.value as Vehicle["billing_unit"])}>
            {(["month", "week", "day", "year"] as const).map((u) => (
              <option key={u} value={u}>{ko.billingUnit[u]} 렌트료</option>
            ))}
          </select>
          <Err msg={e.billing_unit} />
        </div>
        <div className="flex items-center gap-3">
          <input id="iva_applies" name="iva_applies" type="checkbox" className="h-4 w-4" checked={applies} onChange={(ev) => setApplies(ev.target.checked)} />
          <label htmlFor="iva_applies" className="text-sm font-semibold">IVA 적용</label>
        </div>
        <div>
          <label htmlFor="iva_rate" className="field-label">IVA 세율 (%)</label>
          <input id="iva_rate" name="iva_rate" className="field" inputMode="decimal" value={rate} onChange={(ev) => setRate(ev.target.value)} />
          <Err msg={e.iva_rate} />
        </div>
        <div className="rounded-md bg-mist p-3 text-sm sm:col-span-2" aria-live="polite">
          <p className="font-semibold">고객 화면 표시 미리보기</p>
          {valid ? (
            <p className="mt-1 tabular-nums">
              기본 렌트료 {formatMoney(baseN, currency)} · IVA {applies ? formatMoney(iva, currency) : "미적용"} · IVA 포함 {formatMoney(total, currency)} {ko.billingUnitPer[unit]}
            </p>
          ) : (
            <p className="mt-1 text-graphite">기본 렌트료를 입력하세요.</p>
          )}
          <p className="mt-1 text-xs text-graphite">IVA 금액과 IVA 포함 금액은 DB에서 기본 렌트료 × 세율로 자동 계산됩니다.</p>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-lg border border-silver p-4">
        <legend className="px-1 text-sm font-bold">차량 사양</legend>
        <div>
          <label htmlFor="specs" className="field-label">사양 목록 (한 줄에 하나, &ldquo;항목: 값&rdquo;)</label>
          <textarea id="specs" name="specs" rows={8} className="field font-mono text-sm"
            defaultValue={(vehicle?.specs ?? []).map((s) => `${s.label}: ${s.value}`).join("\n")}
            placeholder={"엔진: 1.5 터보 가솔린\n변속기: 자동 6단\n승차 정원: 5인"} />
          <p className="field-hint">
            비교표는 같은 항목명(엔진, 출력, 토크, 변속기, 구동 방식, 연료, 승차 정원, 전장 등)끼리 나란히 비교합니다. 확인된 사양만 입력하세요.
          </p>
          <Err msg={e.specs} />
        </div>
        <div>
          <label htmlFor="spec_note" className="field-label">사양 출처 / 확인 안내</label>
          <textarea id="spec_note" name="spec_note" rows={2} className="field text-sm" maxLength={600} defaultValue={vehicle?.spec_note ?? ""} />
          <Err msg={e.spec_note} />
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className="field-label">차량 상태</label>
          <select id="status" name="status" className="field" defaultValue={vehicle?.status ?? "available"}>
            {(Object.keys(ko.vehicleStatus) as (keyof typeof ko.vehicleStatus)[]).map((s) => (
              <option key={s} value={s}>{ko.vehicleStatus[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort_order" className="field-label">정렬 순서</label>
          <input id="sort_order" name="sort_order" className="field" inputMode="numeric" defaultValue={vehicle?.sort_order ?? 0} />
          <p className="field-hint">작은 숫자가 먼저 표시됩니다.</p>
          <Err msg={e.sort_order} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="field-label">차량 설명 (선택)</label>
          <textarea id="description" name="description" rows={4} className="field" maxLength={4000} defaultValue={vehicle?.description ?? ""} />
          <Err msg={e.description} />
        </div>
      </div>

      <fieldset className="rounded-lg border border-silver p-4">
        <legend className="px-1 text-sm font-bold">공개 URL</legend>
        <label htmlFor="slug" className="field-label">URL 주소 (slug)</label>
        <div className="flex items-center gap-1 text-sm">
          <span className="shrink-0 text-graphite">{siteUrl}/vehiculos/</span>
          <input id="slug" name="slug" className="field font-mono" value={slug} onChange={(ev) => setSlug(ev.target.value)}
            placeholder={vehicle ? "" : autoSlug} maxLength={80} />
        </div>
        <p className="field-hint">
          {vehicle
            ? "URL을 바꾸면 이미 공유된 기존 링크는 더 이상 열리지 않습니다. 꼭 필요한 경우에만 변경하세요."
            : `비워 두면 자동 생성됩니다 (예상: ${autoSlug}). 같은 주소가 이미 있으면 고유 식별자가 자동으로 덧붙습니다.`}
        </p>
        <Err msg={e.slug} />
      </fieldset>

      <div className="flex items-center gap-3">
        <input id="is_published" name="is_published" type="checkbox" className="h-4 w-4" defaultChecked={vehicle?.is_published ?? false} />
        <label htmlFor="is_published" className="text-sm font-semibold">고객용 사이트에 게시</label>
      </div>

      {state.message && (
        <p className={`text-sm font-semibold ${state.ok ? "text-ok" : "text-danger"}`} role="status" data-testid="form-message">
          {state.message}
        </p>
      )}
      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "저장 중…" : vehicle ? "변경 사항 저장" : "차량 등록"}
        </button>
      </div>
    </form>
  );
}
