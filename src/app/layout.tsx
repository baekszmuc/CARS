import type { Metadata, Viewport } from "next";
import "./globals.css";
import { inter, michroma, notoKr } from "./fonts";
import { getSettings, getSiteBase } from "@/lib/data";
import { getLocale, getT } from "@/i18n/server";
import { htmlLang, ogLocale } from "@/i18n/locale";
import { MotionScript } from "@/components/MotionScript";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, base, { t, locale }] = await Promise.all([getSettings(), getSiteBase(), getT()]);
  const name = settings.business_name;
  const description = t("파라과이 차량 렌탈 — 차량 비교, 렌트료와 포함 서비스(정비·보험) 확인, 렌탈 문의.");
  const suffix = t("차량 렌탈");
  return {
    metadataBase: new URL(base.url),
    title: { default: `${name} | ${suffix}`, template: `%s | ${name}` },
    description,
    applicationName: name,
    openGraph: { type: "website", siteName: name, locale: ogLocale[locale], title: `${name} | ${suffix}`, description },
    twitter: { card: "summary_large_image" },
    // 실제 공개 도메인이 등록되기 전(임시 주소)에는 검색 노출을 막는다.
    robots: base.isPublicDomain ? undefined : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html suppressHydrationWarning lang={htmlLang[locale]} className={`${inter.variable} ${notoKr.variable} ${michroma.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <MotionScript />
      </body>
    </html>
  );
}
