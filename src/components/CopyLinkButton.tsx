"use client";
import { useState } from "react";
import { ko } from "@/i18n/ko";
import type { SiteLocale } from "@/i18n/locale";
import { translate } from "@/i18n/t";

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 아래 대체 방식으로 진행
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

export function CopyLinkButton({
  url,
  className = "btn btn-outline btn-sm",
  label,
  locale = "ko",
}: {
  url: string;
  className?: string;
  label?: string;
  locale?: SiteLocale;
}) {
  const t = (s: string) => translate(locale, s);
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  return (
    <button
      type="button"
      className={className}
      data-copy-url={url}
      onClick={async () => {
        const ok = await copyText(url);
        setState(ok ? "ok" : "fail");
        window.setTimeout(() => setState("idle"), 2000);
      }}
    >
      <span aria-live="polite">
        {state === "ok" ? t(ko.common.copied) : state === "fail" ? t("복사 실패 — 주소를 직접 선택하세요") : (label ?? t(ko.common.copyLink))}
      </span>
    </button>
  );
}
