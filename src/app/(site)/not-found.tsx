import Link from "next/link";
import { getT } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <div className="container-page py-28 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-bold">{t("페이지를 찾을 수 없습니다")}</h1>
      <p className="mt-3 text-graphite">{t("차량이 게시 중단되었거나 주소가 변경되었을 수 있습니다.")}</p>
      <Link href="/vehiculos" className="btn btn-primary mt-8">{t("전체 차량 보기")}</Link>
    </div>
  );
}
