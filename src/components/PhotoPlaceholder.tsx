import { ko } from "@/i18n/ko";

/** 실제 사진이 없을 때 사용하는 임시 이미지 영역 — 다른 차량 사진으로 대체하지 않는다. */
export function PhotoPlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`${label} — ${ko.common.photoPending}`}
      className={`flex flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(135deg,#eceef1_0,#eceef1_10px,#f5f6f7_10px,#f5f6f7_20px)] text-graphite ${className}`}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="12.5" r="3.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 6l1.5-2h5L16 6" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <span className="text-xs font-semibold tracking-wide">{ko.common.photoPending}</span>
    </div>
  );
}
