import { Inter, Noto_Sans_KR } from "next/font/google";

/**
 * 브랜드 서체: TT Interphases (상용 서체 — 라이선스 파일이 제공되면 public/fonts 에 추가하고
 * globals.css 의 @font-face 주석을 해제). 그 전까지는 형태가 가까운 Inter 를 사용한다.
 * 한글은 Noto Sans KR. 로고는 서체가 아니라 SVG(LogoMark)로 그린다.
 */
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", adjustFontFallback: false });
export const notoKr = Noto_Sans_KR({ variable: "--font-kr", display: "swap", preload: false, weight: ["400", "500", "700"] });
