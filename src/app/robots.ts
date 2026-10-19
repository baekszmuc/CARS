import type { MetadataRoute } from "next";
import { getSiteBase } from "@/lib/data";

export const revalidate = 300;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getSiteBase();
  if (!base.isPublicDomain) {
    // 실제 공개 도메인 등록 전: 임시 주소가 검색엔진에 노출되지 않도록 차단
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin"] },
    sitemap: `${base.url}/sitemap.xml`,
  };
}
