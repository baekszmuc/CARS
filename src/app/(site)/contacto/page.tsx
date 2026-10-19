import type { Metadata } from "next";
import { PageHeader } from "@/components/Section";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { InquiryForm } from "./InquiryForm";
import { getPublishedVehicles, getSettings } from "@/lib/data";
import { vehicleTitle } from "@/lib/format";
import { buildGeneralInquiryMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "렌탈 문의",
  description: "관심 차량과 희망 일정을 남겨 주시면 이용 가능 여부와 렌탈 조건을 안내드립니다.",
  alternates: { canonical: "/contacto" },
};

type Props = { searchParams: Promise<{ vehiculo?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const [{ vehiculo }, settings, vehicles] = await Promise.all([
    searchParams,
    getSettings(),
    getPublishedVehicles(),
  ]);
  const options = vehicles.map((v) => ({ id: v.id, slug: v.slug, label: vehicleTitle(v) }));

  return (
    <>
      <PageHeader
        eyebrow="Contacto"
        title="렌탈 문의"
        description={
          settings.inquiry_notice ||
          "관심 차량과 희망 일정을 알려 주시면 이용 가능 여부와 렌탈 조건을 안내드립니다."
        }
      />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.6fr_1fr]">
        <InquiryForm vehicles={options} selectedSlug={vehiculo} />
        <aside className="space-y-6">
          <div className="rounded-lg border border-silver p-6">
            <h2 className="text-lg font-bold">WhatsApp 상담</h2>
            <div className="mt-4">
              <WhatsAppButton number={settings.whatsapp_number} message={buildGeneralInquiryMessage(settings)} />
            </div>
          </div>
          <div className="rounded-lg border border-silver p-6">
            <h2 className="text-lg font-bold">연락처</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-graphite">전화</dt>
                <dd className="font-semibold">
                  {settings.phone ? (
                    <a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}>{settings.phone}</a>
                  ) : (
                    "준비 중"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-graphite">이메일</dt>
                <dd className="font-semibold">
                  {settings.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : "준비 중"}
                </dd>
              </div>
              <div>
                <dt className="text-graphite">주소</dt>
                <dd className="font-semibold">{settings.address || "준비 중"}</dd>
              </div>
              <div>
                <dt className="text-graphite">전화 기술 지원</dt>
                <dd className="font-semibold">평일 및 토요일 업무시간 · {settings.support_hours || "업무시간 확인 후 안내"}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}
