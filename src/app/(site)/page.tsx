import Image from "next/image";
import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { StatusBadge } from "@/components/StatusBadge";
import { VehiclePhoto } from "@/components/VehiclePhoto";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { serviceSummary } from "@/content/services";
import { ko } from "@/i18n/ko";
import { coverPhoto, getPublishedVehicles, getSettings } from "@/lib/data";
import { brandLabel, formatMoney, powerOf, priceBreakdown, specValue, vehicleTitle } from "@/lib/format";
import { buildGeneralInquiryMessage } from "@/lib/whatsapp";
import { getT } from "@/i18n/server";
import { translateValue } from "@/i18n/t";
import heroImage from "../../../public/home/hero-night-drive.jpg";

export const revalidate = 300;

/** 홈 — 브랜드 랜딩 페이지. 차량 상세 페이지(레퍼런스 스타일)와는 별도 디자인. */
export default async function HomePage() {
  const [settings, vehicles, { t, locale }] = await Promise.all([getSettings(), getPublishedVehicles(), getT()]);
  const tv = (s: string) => translateValue(locale, s);
  const prices = vehicles.map((v) => priceBreakdown(v));
  const from = prices.length ? prices.reduce((a, b) => (b.total < a.total ? b : a)) : null;

  return (
    <div className="home-lux">
      {/* 1. 히어로 */}
      <section className="relative isolate overflow-hidden bg-[#08090a] text-white" aria-labelledby="home-title">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-parallax -z-10 object-cover object-[62%_center] brightness-[1.6] saturate-[1.1]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#08090a]/90 via-[#08090a]/45 to-[#08090a]/0" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#08090a] to-transparent" />

        <div className="hero-lift container-page flex min-h-[calc(100svh-4rem)] flex-col justify-center py-20">
          <p className="intro lux-eyebrow">Paraguay · Monthly Car Rental</p>
          <h1 id="home-title" className="intro mt-8 max-w-[34rem]" style={{ "--d": 1 } as React.CSSProperties}>
            <span className="sr-only">{settings.business_name} {t("차량 렌탈")}</span>
            <span aria-hidden="true"><LogoMark className="block h-auto w-full text-white" /></span>
          </h1>
          <div className="intro-rule lux-rule mt-10" />
          <p style={{ "--d": 2 } as React.CSSProperties} className="intro mt-8 max-w-xl text-2xl font-light leading-tight tracking-tight text-white sm:text-4xl">
            <span className="block">{t(ko.hero.title)}</span>
            <span className="display mt-3 block text-xl sm:text-3xl">Drive the selected.</span>
          </p>
          <p className="intro mt-6 max-w-md text-sm leading-relaxed text-white/55" style={{ "--d": 3 } as React.CSSProperties}>{t(ko.hero.subtitle)}</p>
          <div className="intro mt-10 flex flex-col gap-3 sm:flex-row" style={{ "--d": 4 } as React.CSSProperties}>
            <a href="#collection" className="btn btn-light">{t("차량 보기")}</a>
            <Link href="/contacto" className="btn btn-outline-dark">{t("상담 문의")}</Link>
          </div>
        </div>

        <div className="container-page relative pb-10">
          <dl className="intro grid grid-cols-3 gap-4 border-t border-white/15 pt-6 text-white/80 sm:max-w-2xl" style={{ "--d": 5 } as React.CSSProperties}>
            <div>
              <dt className="lux-label">{t("보유 차량")}</dt>
              <dd className="display mt-2 text-lg sm:text-xl">{t("{n}종", { n: vehicles.length })}</dd>
            </div>
            {from && (
              <div>
                <dt className="lux-label">{t("월 렌트료 · IVA 포함")}</dt>
                <dd className="display mt-2 text-lg sm:text-xl">
                  {formatMoney(from.total, settings.currency)}<span className="ml-1 text-xs text-white/50">{t("부터")}</span>
                </dd>
              </div>
            )}
            <div>
              <dt className="lux-label">{t("포함 서비스")}</dt>
              <dd className="mt-2 text-sm sm:text-base">{t("정비 · 보험 · 지원")}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 2. 컬렉션 */}
      <section id="collection" className="scroll-mt-16 bg-[#f4f2ee] py-24 sm:py-32" aria-labelledby="collection-title">
        <div className="container-page">
          <div className="reveal mx-auto max-w-xl text-center">
            <p className="lux-eyebrow text-[#8a7650]">The Collection</p>
            <h2 id="collection-title" className="mt-5 text-2xl font-normal sm:text-3xl">{t("{name} 컬렉션", { name: settings.business_name })}</h2>
            <p className="mt-4 text-sm leading-relaxed text-graphite">{t("모든 차량은 월 단위로 계약하며, 정비와 보험이 렌트료에 포함됩니다.")}</p>
          </div>

          {vehicles.length === 0 ? (
            <p className="mt-16 text-center text-graphite">{t("현재 게시된 차량이 없습니다.")}</p>
          ) : (
            <ol className="mt-20 space-y-24 sm:space-y-32">
              {vehicles.map((v, i) => {
                const p = prices[i];
                const power = powerOf(v);
                const facts = [
                  power ? { k: t("출력"), v: `${power.value.toLocaleString("en-US")} ${power.unit}` } : null,
                  specValue(v, "변속기") ? { k: t("변속기"), v: tv(specValue(v, "변속기")!) } : null,
                  specValue(v, "승차 정원") ? { k: t("승차 정원"), v: tv(specValue(v, "승차 정원")!) } : null,
                ].filter(Boolean) as { k: string; v: string }[];
                return (
                  <li key={v.id} data-testid="home-vehicle" className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                    <Link
                      href={`/vehiculos/${v.slug}`}
                      tabIndex={-1}
                      aria-hidden="true"
                      className={`group block lg:col-span-7 ${i % 2 ? "lg:order-2" : ""}`}
                    >
                      <VehiclePhoto
                        photo={coverPhoto(v)}
                        label={vehicleTitle(v)}
                        className="reveal-photo aspect-[3/2] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]"
                        sizes="(min-width: 1024px) 58vw, 100vw"
                      />
                    </Link>
                    <div className={`reveal lg:col-span-5 ${i % 2 ? "lg:order-1" : ""}`}>
                      <p className="display text-xs tracking-[0.3em] text-[#8a7650]">{String(i + 1).padStart(2, "0")}</p>
                      {brandLabel(v) && <p className="lux-label mt-6 text-steel">{brandLabel(v)}</p>}
                      <h3 className="mt-2 text-3xl font-normal leading-tight sm:text-4xl">
                        {brandLabel(v) && <span className="sr-only">{brandLabel(v)} </span>}
                        {vehicleTitle(v)}
                      </h3>
                      {v.variant && <p className="mt-2 text-sm text-graphite">{tv(v.variant)}</p>}
                      <div className="mt-4"><StatusBadge status={v.status} /></div>

                      {facts.length > 0 && (
                        <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-black/10 py-5">
                          {facts.map((f) => (
                            <div key={f.k}>
                              <dt className="lux-label text-steel">{f.k}</dt>
                              <dd className="mt-1.5 text-sm text-obsidian">{f.v}</dd>
                            </div>
                          ))}
                        </dl>
                      )}

                      <p className="mt-6 text-xs text-graphite">
                        {t("{unit} 렌트료", { unit: t(ko.billingUnit[p.unit]) })}{p.ivaApplies ? ` · ${t("IVA 포함")}` : ""}
                      </p>
                      <p className="price-final mt-1 text-2xl tabular-nums sm:text-3xl">
                        {formatMoney(p.total, settings.currency)}{" "}
                        <span className="text-sm text-graphite">{t(ko.billingUnitPer[p.unit])}</span>
                      </p>
                      <Link href={`/vehiculos/${v.slug}`} className="lux-link mt-8 inline-flex items-center gap-3 text-sm">
                        {t("자세히 보기")} <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="reveal mt-24 text-center">
            <Link href="/vehiculos#comparar" className="btn btn-outline">{t(ko.hero.compare)}</Link>
          </div>
        </div>
      </section>

      {/* 3. 포함 서비스 */}
      <section className="bg-[#08090a] py-24 text-white sm:py-32" aria-labelledby="services">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="reveal lg:col-span-4">
              <p className="lux-eyebrow text-[#c8b48a]">Included</p>
              <h2 id="services" className="mt-5 text-2xl font-normal sm:text-3xl">{t("렌트료에 포함된 서비스")}</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/55">
                {t("차량과 관계없이 같은 서비스가 포함됩니다. 적용 범위와 조건은 렌탈 계약서를 기준으로 합니다.")}
              </p>
              <Link href="/servicios" className="lux-link mt-8 inline-flex items-center gap-3 text-sm text-white">
                {t("상세 조건 보기")} <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ul className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
              {serviceSummary.map((s, i) => (
                <li key={s.title} className="reveal border-t border-white/15 py-7">
                  <p className="display text-[10px] tracking-[0.25em] text-[#c8b48a]">{String(i + 1).padStart(2, "0")}</p>
                  <p className="mt-3 text-base">{t(s.title)}</p>
                  <p className="mt-1.5 text-sm text-white/55">{t(s.text)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. 문의 */}
      <section className="bg-[#f4f2ee] py-24 sm:py-32" aria-labelledby="contact">
        <div className="reveal container-page mx-auto max-w-2xl text-center">
          <p className="lux-eyebrow text-[#8a7650]">Contact</p>
          <h2 id="contact" className="mt-5 text-2xl font-normal sm:text-3xl">{t("원하시는 차량을 알려 주세요")}</h2>
          <p className="mt-4 text-sm leading-relaxed text-graphite">
            {(locale === "ko" && settings.inquiry_notice) || t("관심 차량과 희망 일정을 알려 주시면 이용 가능 여부와 렌탈 조건을 안내드립니다.")}
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contacto" className="btn btn-primary">{t("상담 문의")}</Link>
            <WhatsAppButton number={settings.whatsapp_number} message={buildGeneralInquiryMessage(settings, t)} className="btn btn-outline" showMissingNotice={false} />
          </div>
        </div>
      </section>
    </div>
  );
}
