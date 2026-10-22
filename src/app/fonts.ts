import { Inter, Michroma, Noto_Sans_KR } from "next/font/google";

/**
 * 브랜드 서체: TT Interphases (상용 서체 — 라이선스 파일이 제공되면 public/fonts 에 추가하고
 * globals.css 의 @font-face 주석을 해제). 그 전까지는 형태가 가까운 Inter 를 사용한다.
 * 한글은 Noto Sans KR. 로고는 서체가 아니라 SVG(LogoMark)로 그린다.
 * 제목·가격·버튼 등 표시용 글자는 로고와 같은 계열(넓은 각진 산세리프)인 Michroma 를 쓴다.
 * Michroma 에는 한글이 없으므로 한글은 Noto Sans KR 로 표시된다.
 */
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", adjustFontFallback: false });
export const notoKr = Noto_Sans_KR({ variable: "--font-kr", display: "swap", preload: false, weight: ["400", "500", "700"] });
export const michroma = Michroma({ subsets: ["latin"], variable: "--font-michroma", display: "swap", weight: "400" });
