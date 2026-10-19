"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";
import { PHOTO_BUCKET, publicStorageUrl } from "@/lib/env";
import type { VehiclePhoto } from "@/lib/types";
import { deletePhoto, movePhoto, registerPhoto, setCoverPhoto, setPhotoReference, updatePhotoAlt } from "@/app/admin/(panel)/actions";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_BYTES = 8 * 1024 * 1024;

export function PhotoManager({ vehicleId, photos }: { vehicleId: string; photos: VehiclePhoto[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<void>) =>
    start(async () => {
      setMsg(null);
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "작업에 실패했습니다.");
      }
    });

  async function upload(files: FileList) {
    setBusy(true);
    setMsg(null);
    const supabase = getBrowserClient();
    const errors: string[] = [];
    let uploaded = 0;
    for (const file of Array.from(files)) {
      const ext = ALLOWED[file.type];
      if (!ext) {
        errors.push(`${file.name}: JPG, PNG, WEBP, AVIF 형식만 업로드할 수 있습니다.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        errors.push(`${file.name}: 8MB 이하 파일만 업로드할 수 있습니다.`);
        continue;
      }
      const path = `${vehicleId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false, cacheControl: "31536000" });
      if (error) {
        errors.push(`${file.name}: 업로드 실패 (${error.message})`);
        continue;
      }
      try {
        await registerPhoto(vehicleId, path);
        uploaded++;
      } catch (e) {
        await supabase.storage.from(PHOTO_BUCKET).remove([path]);
        errors.push(`${file.name}: ${e instanceof Error ? e.message : "등록 실패"}`);
      }
    }
    setBusy(false);
    if (input.current) input.current.value = "";
    setMsg([uploaded ? `${uploaded}장 업로드 완료` : null, ...errors].filter(Boolean).join("\n") || null);
    router.refresh();
  }

  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className={`btn btn-primary btn-sm ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {busy ? "업로드 중…" : "사진 업로드"}
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            data-testid="photo-input"
            onChange={(e) => e.target.files && e.target.files.length > 0 && upload(e.target.files)}
          />
        </label>
        <span className="text-xs text-graphite">JPG·PNG·WEBP·AVIF, 장당 8MB 이하. 실제 해당 차량 사진만 올려 주세요.</span>
      </div>
      {msg && <p className="mt-3 whitespace-pre-line text-sm" role="status" data-testid="photo-message">{msg}</p>}
      {sorted.length === 0 ? (
        <p className="mt-4 text-sm text-graphite">등록된 사진이 없습니다. 고객 화면에는 &lsquo;실제 차량 사진 준비 중&rsquo; 영역이 표시됩니다.</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="photo-list">
          {sorted.map((p, i) => (
            <li key={p.id} className="overflow-hidden rounded-lg border border-silver">
              <div className="relative aspect-[4/3] bg-silver">
                <img src={publicStorageUrl(PHOTO_BUCKET, p.storage_path)} alt={p.alt ?? ""} className="h-full w-full object-cover" />
                {p.is_reference && (
                  <span className="absolute bottom-2 left-2 rounded bg-obsidian/80 px-2 py-0.5 text-xs font-semibold text-white">참고 이미지</span>
                )}
                {p.is_cover && (
                  <span className="absolute left-2 top-2 rounded bg-obsidian px-2 py-0.5 text-xs font-semibold text-white">대표 사진</span>
                )}
              </div>
              <div className="grid gap-2 p-3">
                <input
                  className="field text-sm"
                  defaultValue={p.alt ?? ""}
                  placeholder="사진 설명 (대체 텍스트)"
                  aria-label="사진 설명"
                  maxLength={200}
                  onBlur={(e) => e.target.value !== (p.alt ?? "") && run(() => updatePhotoAlt(p.id, e.target.value))}
                />
                <label className="flex items-center gap-2 text-xs">
                  <input
                    key={`${p.id}-${p.is_reference}`}
                    type="checkbox"
                    className="h-4 w-4"
                    defaultChecked={p.is_reference}
                    disabled={pending}
                    onChange={(e) => run(() => setPhotoReference(p.id, e.target.checked))}
                  />
                  참고 이미지 (실제 렌탈 차량이 아닌 동일 모델 사진)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" className="btn btn-outline btn-sm" disabled={pending || i === 0} onClick={() => run(() => movePhoto(p.id, "up"))} aria-label="앞으로 이동">←</button>
                  <button type="button" className="btn btn-outline btn-sm" disabled={pending || i === sorted.length - 1} onClick={() => run(() => movePhoto(p.id, "down"))} aria-label="뒤로 이동">→</button>
                  {!p.is_cover && (
                    <button type="button" className="btn btn-outline btn-sm" disabled={pending} onClick={() => run(() => setCoverPhoto(p.id))}>대표로 설정</button>
                  )}
                  <button type="button" className="btn btn-danger btn-sm" disabled={pending}
                    onClick={() => window.confirm("이 사진을 삭제하시겠습니까?") && run(() => deletePhoto(p.id))}>삭제</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
