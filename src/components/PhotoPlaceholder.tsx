import { ko } from "@/i18n/ko";

/** 실제 사진이 없을 때 사용하는 임시 이미지 영역 — 다른 차량 사진으로 대체하지 않는다. */
export function PhotoPlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`${label} — ${ko.common.photoPending}`}
      className={`relative flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#f3f4f6] to-[#e4e6ea] text-steel ${className}`}
    >
      {/* 일반 SUV 실루엣 (특정 차량을 묘사하지 않음) */}
      <svg viewBox="0 0 240 90" className="w-2/5 max-w-[220px]" fill="none" aria-hidden="true">
        <path
          d="M14 66h12m40 0h104m40 0h16c3 0 5-2 5-5V50c0-5-3-8-8-9l-30-6-26-18c-4-3-8-4-13-4H82c-6 0-10 2-14 6L52 34l-26 5c-6 1-10 5-10 11v11c0 3 2 5 5 5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="46" cy="66" r="13" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="190" cy="66" r="13" stroke="currentColor" strokeWidth="2.5" />
        <path d="M60 34h112l-24-17c-3-2-6-3-9-3H84c-4 0-7 1-10 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M116 14v20" stroke="currentColor" strokeWidth="2" />
      </svg>
      <span className="text-[10px] font-semibold tracking-wide text-graphite">{ko.common.photoPending}</span>
    </div>
  );
}
