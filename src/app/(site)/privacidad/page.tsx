import type { Metadata } from "next";
import { PageHeader } from "@/components/Section";
import { getSettings } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  alternates: { canonical: "/privacidad" },
};

export default async function PrivacyPage() {
  const s = await getSettings();
  const contact = [s.email && `이메일 ${s.email}`, s.phone && `전화 ${s.phone}`].filter(Boolean).join(", ");
  return (
    <>
      <PageHeader eyebrow="Privacidad" title="개인정보 처리방침" />
      <div className="container-page max-w-3xl py-14">
        <div className="space-y-8 leading-relaxed text-charcoal [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-obsidian [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
          <section>
            <h2>1. 수집하는 정보</h2>
            <p className="mt-2">{s.business_name}은(는) 렌탈 문의 양식을 통해 다음 정보를 수집합니다.</p>
            <ul>
              <li>필수: 이름, 전화번호</li>
              <li>선택: 이메일, 관심 차량, 희망 인수일·반납일, 추가 문의사항</li>
            </ul>
          </section>
          <section>
            <h2>2. 이용 목적</h2>
            <p className="mt-2">
              수집한 정보는 렌탈 문의에 대한 답변, 차량 이용 가능 여부 및 렌탈 조건 안내에만 사용하며, 광고 목적으로
              사용하지 않습니다.
            </p>
          </section>
          <section>
            <h2>3. 보관 및 파기</h2>
            <p className="mt-2">
              문의 정보는 문의 응대 및 계약 진행에 필요한 기간 동안 보관하며, 목적이 달성되면 지체 없이 파기합니다.
              관련 법령에서 보관을 요구하는 경우에는 해당 기간 동안 보관합니다.
            </p>
          </section>
          <section>
            <h2>4. 제3자 제공 및 처리 위탁</h2>
            <p className="mt-2">
              법령에 따른 경우를 제외하고 고객의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 웹사이트 운영을 위해
              데이터 저장 및 호스팅 서비스(Supabase, Vercel)를 이용합니다.
            </p>
          </section>
          <section>
            <h2>5. 이용자의 권리</h2>
            <p className="mt-2">
              이용자는 언제든지 본인의 개인정보 열람, 정정, 삭제를 요청할 수 있습니다.
              {contact ? ` 요청 연락처: ${contact}.` : " 요청은 문의 페이지를 통해 접수할 수 있습니다."}
            </p>
          </section>
          <p className="rounded-md bg-mist p-4 text-sm text-graphite">
            본 방침은 파라과이 관련 법령에 따라 운영자의 법률 검토를 거쳐 보완될 수 있습니다.
          </p>
        </div>
      </div>
    </>
  );
}
