import Link from "next/link";
import { OptionInquiryButton } from "@/components/OptionInquiryButton";
import { VehicleOverview, maxHpOf } from "@/components/VehicleOverview";
import { VehiclePhoto } from "@/components/VehiclePhoto";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { serviceSummary } from "@/content/services";
import { ko } from "@/i18n/ko";
import { coverPhoto, getPublishedVehicles, getSettings, getSiteBase } from "@/lib/data";
import { brandLabel, formatMoney, priceBreakdown, vehicleTitle } from "@/lib/format";
import { vehicleUrl } from "@/lib/site-url";
import { buildGeneralInquiryMessage } from "@/lib/whatsapp";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, vehicles, base] = await Promise.all([getSettings(), getPublishedVehicles(), getSiteBase()]);
  const maxHp = maxHpOf(vehicles);

  return (
    <>
      {/* 1. 홈 — 레퍼런스 구성: 검은 띠 위의 차량, 차량명, 탭, 게이지 */}
      <section aria-labelledby="home-title">
        <div className="bg-[#0e0f11]">
          <div className="container-page pt-10 text-center sm:pt-14">
            <p className="text-[10px] tracking-[0.3em] text-steel">PARAGUAY · RENTAL</p>
            <h1 id="home-title" className="mt-3 text-lg font-normal text-white sm:text-xl">
              {settings.business_name} 차량 렌탈
            </h1>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <p className="container-page py-16 text-center text-graphite">현재 게시된 차량이 없습니다.</p>
        ) : (
          <div className="tabset">
            {vehicles.map((v, i) => (
              <input
                key={v.id}
                type="radio"
                name="home-lineup"
                id={`lineup-${v.slug}`}
                className="tab-input sr-only"
                defaultChecked={i === 0}
                aria-label={vehicleTitle(v)}
              />
            ))}

            <div className="tab-heroes">
              {vehicles.map((v, i) => (
                <div key={v.id} className="tab-hero">
                  <div className="band-hero">
                    <div className="container-page pt-8 sm:pt-12">
                      <Link href={`/vehiculos/${v.slug}`} className="mx-auto block max-w-4xl" tabIndex={-1} aria-hidden="true">
                        <VehiclePhoto photo={coverPhoto(v)} label={vehicleTitle(v)} className="aspect-[16/9] shadow-2xl shadow-black/30" priority={i === 0} sizes="(min-width: 1024px) 896px, 100vw" />
                      </Link>
                    </div>
                  </div>
                  <div className="container-page mt-8 flex flex-wrap items-end justify-between gap-4 sm:mt-10">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <h2 className="text-3xl font-normal sm:text-4xl">
                        {brandLabel(v) && <span className="sr-only">{brandLabel(v)} </span>}
                        {vehicleTitle(v)}
                      </h2>
                      {v.variant && <p className="text-sm text-graphite">{v.variant}</p>}
                    </div>
                    <Link href={`/vehiculos/${v.slug}`} className="text-sm text-charcoal hover:text-obsidian">
                      차량 상세 보기 →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="tab-labels mt-8 border-b border-black/10">
              <div className="container-page flex justify-center gap-6 overflow-x-auto text-sm sm:gap-10">
                {vehicles.map((v) => (
                  <label key={v.id} htmlFor={`lineup-${v.slug}`}>
                    {v.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="tab-panels">
              {vehicles.map((v) => {
                const p = priceBreakdown(v);
                return (
                  <div key={v.id} className="tab-panel">
                    <div className="container-page py-14">
                      <VehicleOverview vehicle={v} maxHp={maxHp} />
                      <div className="mx-auto mt-14 max-w-xl border-t border-black/10 pt-8 text-center">
                        <p className="text-xs text-graphite">
                          최종 {ko.billingUnit[p.unit]} 렌트료{p.ivaApplies ? " · IVA 포함" : ""}
                        </p>
                        <p className="price-final mt-2 text-3xl tabular-nums sm:text-4xl">
                          {formatMoney(p.total, settings.currency)}{" "}
                          <span className="text-sm text-graphite">{ko.billingUnitPer[p.unit]}</span>
                        </p>
                        {p.ivaApplies && (
                          <p className="mt-2 text-xs text-graphite">
                            기본 {formatMoney(p.base, settings.currency)} + IVA {formatMoney(p.iva, settings.currency)}
                          </p>
                        )}
                        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                          <OptionInquiryButton vehicle={v} settings={settings} url={vehicleUrl(base, v.slug)} className="btn btn-primary" />
                          <Link href={`/vehiculos/${v.slug}`} className="btn btn-outline">상세 정보</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="container-page -mt-6 text-center text-[11px] text-steel">
              출력 게이지는 보유 차량 중 가장 높은 출력을 기준으로 표시합니다.
            </p>
          </div>
        )}
      </section>

      {/* 2. 소개 */}
      <section className="mt-20 bg-white py-20" aria-labelledby="about">
        <div className="container-page mx-auto max-w-2xl text-center">
          <p className="eyebrow">{settings.business_name}</p>
          <h2 id="about" className="mt-4 text-2xl font-normal text-balance sm:text-3xl">{ko.hero.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-graphite">{ko.hero.subtitle}</p>
          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <Link href="/vehiculos" className="btn btn-primary">차량 카탈로그</Link>
            <Link href="/vehiculos#comparar" className="btn btn-outline">{ko.hero.compare}</Link>
          </div>
        </div>
      </section>

      {/* 3. 포함 서비스 */}
      <section className="container-page py-20" aria-labelledby="services">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Servicios</p>
          <h2 id="services" className="mt-3 text-2xl font-normal sm:text-3xl">렌트료에 포함된 서비스</h2>
          <p className="mt-3 text-sm text-graphite">모든 차량에 동일하게 포함됩니다. 실제 적용 범위와 조건은 렌탈 계약서를 기준으로 합니다.</p>
        </div>
        <ul className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {serviceSummary.map((s, i) => (
            <li key={s.title} className="border-t border-black/15 py-6">
              <p className="text-[10px] tracking-[0.2em] text-steel">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-2 font-medium">{s.title}</p>
              <p className="mt-1.5 text-sm text-graphite">{s.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-center">
          <Link href="/servicios" className="btn btn-outline btn-sm">정비 주기·보험 등 상세 조건</Link>
        </div>
      </section>

      {/* 4. 문의 */}
      <section className="container-page" aria-labelledby="contact">
        <div className="grid gap-6 bg-[#0e0f11] p-8 text-white sm:p-12 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <h2 id="contact" className="text-2xl font-normal">렌탈 문의</h2>
            <p className="mt-3 text-sm text-silver">
              {settings.inquiry_notice || "관심 차량과 희망 일정을 알려 주시면 이용 가능 여부와 렌탈 조건을 안내드립니다."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link href="/contacto" className="btn btn-light">문의하기</Link>
            <WhatsAppButton number={settings.whatsapp_number} message={buildGeneralInquiryMessage(settings)} className="btn btn-outline-dark" showMissingNotice={false} />
          </div>
        </div>
      </section>
    </>
  );
}
