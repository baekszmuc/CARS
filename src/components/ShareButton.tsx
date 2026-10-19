"use client";
import { useEffect, useState } from "react";
import { ko } from "@/i18n/ko";

/** Web Share API를 지원하는 기기에서만 표시된다. */
export function ShareButton({ url, title, text }: { url: string; title: string; text?: string }) {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);
  if (!supported) return null;
  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      onClick={() => {
        navigator.share({ url, title, text }).catch(() => {
          // 사용자가 공유를 취소한 경우 — 별도 처리 없음
        });
      }}
    >
      {ko.common.share}
    </button>
  );
}
