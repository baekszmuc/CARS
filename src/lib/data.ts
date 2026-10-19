import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { BRANDING_BUCKET, PHOTO_BUCKET, publicStorageUrl } from "@/lib/env";
import { resolveSiteBase } from "@/lib/site-url";
import type { HandoverItem, Settings, Vehicle, VehiclePhoto } from "@/lib/types";

const VEHICLE_FIELDS =
  "id, slug, name, model_year, mileage_km, base_price, iva_applies, iva_rate, iva_amount, total_price, billing_unit, status, description, is_published, is_archived, sort_order, created_at, updated_at, vehicle_photos(id, vehicle_id, storage_path, alt, sort_order, is_cover, created_at)";

export { VEHICLE_FIELDS };

export function sortPhotos(photos: VehiclePhoto[] | undefined): VehiclePhoto[] {
  return [...(photos ?? [])].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
  );
}

export function photoUrl(photo: Pick<VehiclePhoto, "storage_path">): string {
  return publicStorageUrl(PHOTO_BUCKET, photo.storage_path);
}

export function coverPhoto(v: Vehicle): VehiclePhoto | null {
  return sortPhotos(v.vehicle_photos)[0] ?? null;
}

export const getSettings = cache(async (): Promise<Settings> => {
  const { data, error } = await createPublicClient().from("settings").select("*").eq("id", 1).single();
  if (error) throw new Error(`사업 설정을 불러오지 못했습니다: ${error.message}`);
  return data as Settings;
});

export function logoUrl(settings: Settings): string | null {
  return settings.logo_path ? publicStorageUrl(BRANDING_BUCKET, settings.logo_path) : null;
}

export const getSiteBase = cache(async () => resolveSiteBase(await getSettings()));

/** 게시된 차량 목록 (RLS: is_published AND NOT is_archived) */
export const getPublishedVehicles = cache(async (): Promise<Vehicle[]> => {
  const { data, error } = await createPublicClient()
    .from("vehicles")
    .select(VEHICLE_FIELDS)
    .eq("is_published", true)
    .eq("is_archived", false)
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(`차량 목록을 불러오지 못했습니다: ${error.message}`);
  return data as Vehicle[];
});

export const getPublishedVehicle = cache(async (slug: string): Promise<Vehicle | null> => {
  const { data, error } = await createPublicClient()
    .from("vehicles")
    .select(VEHICLE_FIELDS)
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("is_archived", false)
    .maybeSingle();
  if (error) throw new Error(`차량 정보를 불러오지 못했습니다: ${error.message}`);
  return data as Vehicle | null;
});

export const getHandoverItems = cache(async (): Promise<HandoverItem[]> => {
  const { data, error } = await createPublicClient()
    .from("handover_items")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("sort_order");
  if (error) throw new Error(`인수 품목을 불러오지 못했습니다: ${error.message}`);
  return data as HandoverItem[];
});
