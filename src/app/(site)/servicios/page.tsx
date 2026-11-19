import { getT } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/Section";
import { ServicesDetail } from "@/components/ServicesDetail";
import { servicesIntro } from "@/content/services";
import { getSettings } from "@/lib/data";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("렌트료에 포함된 서비스"),
    description: t("예방 정비, 주요 부품 교체, 타이어·배터리, 종합보험, 시 운행 허가 유지, 전화 지원."),
    alternates: { canonical: "/servicios" },
  };
}

export default async function ServicesPage() {
  const [settings, { t }] = await Promise.all([getSettings(), getT()]);
  return (
    <>
      <PageHeader eyebrow="Servicios" title={t("렌트료에 포함된 서비스")} description={t(servicesIntro)} />
      <div className="container-page py-14">
        <ServicesDetail settings={settings} />
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/vehiculos" className="btn btn-primary">{t("차량 비교하기")}</Link>
          <Link href="/contacto" className="btn btn-outline">{t("상담 문의")}</Link>
        </div>
      </div>
    </>
  );
}
