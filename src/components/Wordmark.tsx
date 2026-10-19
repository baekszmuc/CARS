/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

/** 실제 로고가 등록되면 로고 이미지를, 아니면 텍스트 워드마크를 표시한다. */
export function Wordmark({
  name,
  logoUrl,
  inverted = false,
  href = "/",
}: {
  name: string;
  logoUrl: string | null;
  inverted?: boolean;
  href?: string;
}) {
  return (
    <Link href={href} className="inline-flex items-center gap-2" aria-label={`${name} 홈`}>
      {logoUrl ? (
        <img src={logoUrl} alt={name} className="h-8 w-auto max-w-[160px] object-contain" />
      ) : (
        <span
          className={`text-lg font-extrabold tracking-[0.18em] ${inverted ? "text-white" : "text-obsidian"}`}
        >
          {name.toUpperCase()}
        </span>
      )}
    </Link>
  );
}
