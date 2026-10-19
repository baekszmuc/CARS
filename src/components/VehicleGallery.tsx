"use client";
import Image from "next/image";
import { useState } from "react";

export interface GalleryPhoto {
  id: string;
  url: string;
  alt: string;
  isReference: boolean;
}

/** 대표 사진 + 썸네일 선택 갤러리 (사진이 2장 이상일 때 사용) */
export function VehicleGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [active, setActive] = useState(0);
  const current = photos[active] ?? photos[0];
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-silver">
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt}
          fill
          priority={active === 0}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
        {current.isReference && (
          <span className="absolute bottom-2 left-2 rounded bg-obsidian/80 px-2 py-0.5 text-[10px] font-semibold text-white">
            참고 이미지
          </span>
        )}
      </div>
      <ul className="mt-3 grid grid-cols-4 gap-3" aria-label="사진 선택">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${i + 1}번째 사진 보기: ${p.alt}`}
              aria-pressed={i === active}
              className={`relative block aspect-[4/3] w-full overflow-hidden rounded-md bg-silver outline-offset-2 ${
                i === active ? "ring-2 ring-obsidian" : "opacity-75 hover:opacity-100"
              }`}
            >
              <Image src={p.url} alt="" fill sizes="20vw" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
