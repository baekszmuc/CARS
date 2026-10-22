import type { Metadata, Viewport } from "next";
import "./globals.css";
import { inter, michroma, notoKr } from "./fonts";
import { getSettings, getSiteBase } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, base] = await Promise.all([getSettings(), getSiteBase()]);
  const name = settings.business_name;
  const description = "파라과이 차량 렌탈 — 차량 비교, 렌트료와 포함 서비스(정비·보험) 확인, 렌탈 문의.";
  return {
    metadataBase: new URL(base.url),
    title: { default: `${name} | 차량 렌탈`, template: `%s | ${name}` },
    description,
    applicationName: name,
    openGraph: { type: "website", siteName: name, locale: "ko_KR", title: `${name} | 차량 렌탈`, description },
    twitter: { card: "summary_large_image" },
    // 실제 공개 도메인이 등록되기 전(임시 주소)에는 검색 노출을 막는다.
    robots: base.isPublicDomain ? undefined : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoKr.variable} ${michroma.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
