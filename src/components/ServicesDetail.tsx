import { ko } from "@/i18n/ko";
import { insurance, maintenance, majorParts, municipal, support, tiresBattery } from "@/content/services";
import type { Settings } from "@/lib/types";

function Card({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-silver bg-white p-6" aria-labelledby={`svc-${n}`}>
      <p className="text-xs font-bold tracking-widest text-steel">{n}</p>
      <h3 id={`svc-${n}`} className="mt-1 text-lg font-bold">
        {title}
      </h3>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-charcoal">{children}</div>
    </section>
  );
}

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-obsidian" />
          {i}
        </li>
      ))}
    </ul>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="border-l-2 border-silver pl-3 text-xs text-graphite">{children}</p>;
}

export function MaintenanceCard() {
  return (
    <Card n="01" title={maintenance.title}>
      <p>{maintenance.summary}</p>
      <List items={maintenance.items} />
      <Note>{maintenance.note} 부속서 C의 주기별 세부 항목은 계약 시 함께 안내드립니다.</Note>
    </Card>
  );
}

export function PartsCard() {
  return (
    <Card n="02" title={majorParts.title}>
      <p>{majorParts.summary}</p>
      <ul className="divide-y divide-silver rounded border border-silver">
        {majorParts.items.map((i) => (
          <li key={i.km} className="flex gap-4 px-3 py-2">
            <span className="w-24 shrink-0 font-semibold tabular-nums">{i.km}</span>
            <span>{i.text}</span>
          </li>
        ))}
      </ul>
      <Note>{majorParts.note}</Note>
    </Card>
  );
}

export function TiresCard() {
  return (
    <Card n="03" title={tiresBattery.title}>
      <List items={tiresBattery.items} />
      <Note>{tiresBattery.note}</Note>
    </Card>
  );
}

export function InsuranceCard({ settings }: { settings: Settings }) {
  const provider = settings.insurance_provider || "보험사";
  return (
    <Card n="04" title={insurance.title}>
      <p className="inline-flex rounded bg-mist px-2 py-1 text-xs font-semibold" data-testid="insurance-status">
        {ko.insuranceStatus[settings.insurance_status]}
        {settings.insurance_status !== "not_set" && settings.insurance_provider ? ` · ${settings.insurance_provider}` : ""}
      </p>
      <p>
        {settings.insurance_status === "active"
          ? `${provider} 보험을 기준으로 다음 항목이 보장됩니다.`
          : `${provider} 제안서 기준 보장 항목은 다음과 같습니다.`}
      </p>
      <List items={insurance.coverage} />
      {settings.insurance_note && <p>{settings.insurance_note}</p>}
      <Note>{insurance.note}</Note>
    </Card>
  );
}

export function MunicipalCard() {
  return (
    <Card n="05" title={municipal.title}>
      <p>{municipal.text}</p>
    </Card>
  );
}

export function SupportCard({ settings }: { settings: Settings }) {
  return (
    <Card n="06" title={support.title}>
      <p>{support.text}</p>
      <p className="text-graphite">
        업무시간: {settings.support_hours || "확인 후 안내드립니다"}
        {settings.phone ? ` · 전화 ${settings.phone}` : ""}
      </p>
    </Card>
  );
}

export function ServicesDetail({ settings }: { settings: Settings }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <MaintenanceCard />
      <PartsCard />
      <TiresCard />
      <InsuranceCard settings={settings} />
      <MunicipalCard />
      <SupportCard settings={settings} />
    </div>
  );
}
