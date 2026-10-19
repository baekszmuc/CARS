import type { Metadata } from "next";
import { HandoverList } from "@/components/HandoverList";
import { PageHeader } from "@/components/Section";
import { getHandoverItems } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "차량 렌트 시 함께 제공되는 항목",
  description: "차량 서류(Cédula Verde 등), 차량 비품, 열쇠 2세트 — 차량 렌트 시 제공 품목 안내.",
  alternates: { canonical: "/incluye" },
};

export default async function IncludesPage() {
  const items = await getHandoverItems();
  return (
    <>
      <PageHeader
        eyebrow="Entrega"
        title="차량 렌트 시 함께 제공되는 항목"
        description="계약상 기본 제공 목록입니다. 각 서류와 품목의 실제 제공 여부 및 적용 조건은 계약과 차량별 확인 사항에 따르며, 인도 전 담당자가 차량별로 확인합니다."
      />
      <div className="container-page py-14">
        <HandoverList items={items} />
      </div>
    </>
  );
}
