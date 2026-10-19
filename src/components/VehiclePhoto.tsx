import Image from "next/image";
import { PhotoPlaceholder } from "./PhotoPlaceholder";
import { photoUrl } from "@/lib/data";
import type { VehiclePhoto as Photo } from "@/lib/types";

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
    </div>
  );
}
