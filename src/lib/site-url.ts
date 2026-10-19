import type { Settings } from "./types";

export interface SiteBase {
  /** 링크 생성에 사용하는 기준 주소 (끝에 / 없음) */
  url: string;
  /** 관리자가 실제 공개 도메인을 등록했는지 여부 */
  isPublicDomain: boolean;
  /** 주소를 어디서 가져왔는지 (관리자 화면 안내용) */
  source: "settings" | "env" | "vercel" | "fallback";
}

function clean(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * 공개 URL 기준 주소를 결정한다.
 * 1) 관리자 설정의 웹사이트 도메인 (실제 공개 주소)
 * 2) NEXT_PUBLIC_SITE_URL 환경 변수 (임시/개발 주소)
 * 3) Vercel 배포 주소 (임시 주소)
 * 4) http://localhost:3000
 */
export function resolveSiteBase(settings: Pick<Settings, "site_domain"> | null): SiteBase {
  if (settings?.site_domain) {
    return { url: clean(settings.site_domain), isPublicDomain: true, source: "settings" };
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return { url: clean(process.env.NEXT_PUBLIC_SITE_URL), isPublicDomain: false, source: "env" };
  }
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) {
    return { url: `https://${clean(vercel)}`, isPublicDomain: false, source: "vercel" };
  }
  return { url: "http://localhost:3000", isPublicDomain: false, source: "fallback" };
}

export function vehicleUrl(base: SiteBase | string, slug: string): string {
  const root = typeof base === "string" ? clean(base) : base.url;
  return `${root}/vehiculos/${encodeURIComponent(slug)}`;
}
