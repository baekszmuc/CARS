/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { LogoMark } from "./LogoMark";

/**
 * BS CARS 로고. 관리자가 로고 파일을 업로드하면 그 이미지를, 아니면 기본 벡터 로고를 표시한다.
 */
export function Wordmark({
  name,
  logoUrl,
  inverted = false,
  href = "/",
  size = "md",
}: {
  name: string;
  logoUrl: string | null;
  inverted?: boolean;
  href?: string;
  size?: "md" | "lg";
}) {
  const h = size === "lg" ? "h-6" : "h-[13px] sm:h-[15px]";
  return (
    <Link href={href} className="inline-flex items-center" aria-label={`${name} 홈`}>
      {logoUrl ? (
        <img src={logoUrl} alt={name} className={`${size === "lg" ? "h-10" : "h-6"} w-auto max-w-[200px] object-contain`} />
      ) : (
        <LogoMark title={name} className={`${h} w-auto ${inverted ? "text-white" : "text-obsidian"}`} />
      )}
    </Link>
  );
}
