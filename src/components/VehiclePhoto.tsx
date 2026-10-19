import Image from "next/image";
import { PhotoPlaceholder } from "./PhotoPlaceholder";
import { photoUrl } from "@/lib/data";
import type { VehiclePhoto as Photo } from "@/lib/types";

export function ReferenceBadge() {
  return (
    <span className="absolute bottom-2 left-2 rounded bg-obsidian/80 px-2 py-0.5 text-[10px] font-semibold text-white">
      참고 이미지
    </span>
  );
}

export function VehiclePhoto({
  photo,
  label,
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  photo: Photo | null;
  label: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!photo) return <PhotoPlaceholder label={label} className={className} />;
  return (
    <div className={`relative overflow-hidden bg-silver ${className}`}>
      <Image
        src={photoUrl(photo)}
        alt={photo.alt || label}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      {photo.is_reference && <ReferenceBadge />}
    </div>
  );
}
