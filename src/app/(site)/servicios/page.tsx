import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/Section";
import { ServicesDetail } from "@/components/ServicesDetail";
import { servicesIntro } from "@/content/services";
import { getSettings } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "렌트료에 포함된 서비스",
  description: "예방 정비, 주요 부품 교체, 타이어·배터리, 전 위험 보험, 시청 운행 허가 유지, 전화 기술 지원.",
  alternates: { canonical: "/servicios" },
};

export default async function ServicesPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader eyebrow="Servicios" title="렌트료에 포함된 서비스" description={servicesIntro} />
      <div className="container-page py-14">
        <ServicesDetail settings={settings} />
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/vehiculos" className="btn btn-primary">차량 비교하기</Link>
          <Link href="/contacto" className="btn btn-outline">상담 문의하기</Link>
        </div>
      </div>
    </>
  );
}
