/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

/**
 * BS CARS 워드마크 — 넓은 자간의 기하학 서체 로고.
 * 관리자가 로고 파일을 업로드하면 그 이미지를 대신 표시한다.
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
  return (
    <Link href={href} className="inline-flex items-center" aria-label={`${name} 홈`}>
      {logoUrl ? (
        <img src={logoUrl} alt={name} className={`${size === "lg" ? "h-10" : "h-6"} w-auto max-w-[200px] object-contain`} />
      ) : (
        <span className={`wordmark ${size === "lg" ? "text-2xl" : "text-base sm:text-lg"} ${inverted ? "text-white" : "text-obsidian"}`}>
          {name.toUpperCase()}
        </span>
      )}
    </Link>
  );
}
