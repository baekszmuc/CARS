"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";
import { BRANDING_BUCKET } from "@/lib/env";
import { LogoMark } from "@/components/LogoMark";
import { setLogo } from "@/app/admin/(panel)/actions";

const ALLOWED: Record<string, string> = { "image/png": "png", "image/svg+xml": "svg", "image/webp": "webp", "image/jpeg": "jpg" };

export function LogoUploader({ currentUrl }: { currentUrl: string | null }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onFile(file: File) {
    const ext = ALLOWED[file.type];
    if (!ext) return setMsg("PNG, SVG, WEBP, JPG 형식만 가능합니다.");
    if (file.size > 2 * 1024 * 1024) return setMsg("2MB 이하 파일만 가능합니다.");
    const path = `logo/${crypto.randomUUID()}.${ext}`;
    const { error } = await getBrowserClient().storage.from(BRANDING_BUCKET).upload(path, file, { contentType: file.type });
    if (error) return setMsg(`업로드 실패: ${error.message}`);
    start(async () => {
      try {
        await setLogo(path);
        setMsg("로고가 변경되었습니다.");
        router.refresh();
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "저장 실패");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex h-16 min-w-40 items-center justify-center rounded-md bg-obsidian px-4">
        {currentUrl ? (
          <img src={currentUrl} alt="현재 로고" className="h-10 w-auto object-contain" />
        ) : (
          <LogoMark className="h-3.5 w-auto text-white" />
        )}
      </div>
      <div className="grid gap-2">
        <label className="btn btn-outline btn-sm">
          로고 업로드
          <input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" className="sr-only"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
        {currentUrl && (
          <button type="button" className="btn btn-danger btn-sm" disabled={pending}
            onClick={() => start(async () => { await setLogo(null); setMsg("텍스트 워드마크로 되돌렸습니다."); router.refresh(); })}>
            로고 제거
          </button>
        )}
      </div>
      <p className="text-xs text-graphite">{currentUrl ? "" : "업로드한 로고가 없으면 기본 BS CARS 로고가 사용됩니다."} {msg}</p>
    </div>
  );
}
