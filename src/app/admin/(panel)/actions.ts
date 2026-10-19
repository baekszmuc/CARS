"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { BRANDING_BUCKET, PHOTO_BUCKET } from "@/lib/env";
import { flattenErrors, settingsSchema, vehicleSchema, type FieldErrors } from "@/lib/validation";
import { createSessionClient } from "@/lib/supabase/server";

export interface FormState {
  ok: boolean;
  errors: FieldErrors;
  message?: string;
}

const uuid = z.string().uuid();

/** 고객용 페이지 전체 캐시를 무효화해 수정 사항을 즉시 반영한다. */
function refreshPublic() {
  revalidatePath("/", "layout");
}

function dbMessage(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "이미 사용 중인 URL 주소입니다. 다른 주소를 입력해 주세요.";
  if (error.code === "42501") return "권한이 없습니다.";
  return `저장하지 못했습니다: ${error.message}`;
}

// ── 차량 ────────────────────────────────────────────────────────────────
function vehicleInput(fd: FormData) {
  return {
    name: String(fd.get("name") ?? ""),
    brand: String(fd.get("brand") ?? ""),
    variant: String(fd.get("variant") ?? ""),
    specs: String(fd.get("specs") ?? ""),
    spec_note: String(fd.get("spec_note") ?? ""),
    model_year: String(fd.get("model_year") ?? ""),
    mileage_km: String(fd.get("mileage_km") ?? ""),
    base_price: String(fd.get("base_price") ?? ""),
    iva_applies: fd.get("iva_applies") === "on",
    iva_rate: String(fd.get("iva_rate") ?? ""),
    billing_unit: String(fd.get("billing_unit") ?? ""),
    status: String(fd.get("status") ?? ""),
    description: String(fd.get("description") ?? ""),
    sort_order: String(fd.get("sort_order") ?? ""),
    is_published: fd.get("is_published") === "on",
    slug: String(fd.get("slug") ?? ""),
  };
}

export async function createVehicle(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = vehicleSchema.safeParse(vehicleInput(fd));
  if (!parsed.success) return { ok: false, errors: flattenErrors(parsed.error), message: "입력 내용을 확인해 주세요." };
  // slug를 비워 두면 DB 트리거가 차량명+연식으로 자동 생성하고, 중복 시 고유 식별자를 덧붙인다.
  const { data, error } = await supabase.from("vehicles").insert(parsed.data).select("id").single();
  if (error) return { ok: false, errors: {}, message: dbMessage(error) };
  refreshPublic();
  redirect(`/admin/vehiculos/${data.id}?created=1`);
}

export async function updateVehicle(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, errors: {}, message: "잘못된 차량 ID" };
  const parsed = vehicleSchema.safeParse(vehicleInput(fd));
  if (!parsed.success) return { ok: false, errors: flattenErrors(parsed.error), message: "입력 내용을 확인해 주세요." };
  const { slug, ...rest } = parsed.data;
  const patch = slug ? { ...rest, slug } : rest; // 빈 값이면 기존 URL 유지
  const { error } = await supabase.from("vehicles").update(patch).eq("id", id);
  if (error) return { ok: false, errors: {}, message: dbMessage(error) };
  refreshPublic();
  revalidatePath(`/admin/vehiculos/${id}`);
  return { ok: true, errors: {}, message: "저장되었습니다. 고객용 페이지에 반영되었습니다." };
}

export async function setPublished(id: string, published: boolean) {
  const { supabase } = await requireAdmin();
  uuid.parse(id);
  const { error } = await supabase
    .from("vehicles")
    .update(published ? { is_published: true, is_archived: false } : { is_published: false })
    .eq("id", id);
  if (error) throw new Error(dbMessage(error));
  refreshPublic();
  revalidatePath("/admin", "layout");
}

export async function setArchived(id: string, archived: boolean) {
  const { supabase } = await requireAdmin();
  uuid.parse(id);
  const { error } = await supabase
    .from("vehicles")
    .update(archived ? { is_archived: true, is_published: false } : { is_archived: false })
    .eq("id", id);
  if (error) throw new Error(dbMessage(error));
  refreshPublic();
  revalidatePath("/admin", "layout");
}

export async function deleteVehicle(id: string) {
  const { supabase } = await requireAdmin();
  uuid.parse(id);
  const { data: photos } = await supabase.from("vehicle_photos").select("storage_path").eq("vehicle_id", id);
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw new Error(dbMessage(error));
  if (photos?.length) {
    await supabase.storage.from(PHOTO_BUCKET).remove(photos.map((p) => p.storage_path));
  }
  refreshPublic();
  redirect("/admin/vehiculos?deleted=1");
}

// ── 사진 ────────────────────────────────────────────────────────────────
const photoPath = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|avif)$/;

/** 브라우저에서 Storage에 업로드한 뒤 호출해 사진을 차량에 연결한다. */
export async function registerPhoto(vehicleId: string, storagePath: string) {
  const { supabase } = await requireAdmin();
  uuid.parse(vehicleId);
  if (!photoPath.test(storagePath) || !storagePath.startsWith(`${vehicleId}/`)) {
    throw new Error("잘못된 사진 경로입니다.");
  }
  const folder = storagePath.split("/")[0];
  const file = storagePath.split("/")[1];
  const { data: listed, error: listError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .list(folder, { search: file, limit: 1 });
  if (listError || !listed?.some((o) => o.name === file)) throw new Error("업로드된 파일을 찾을 수 없습니다.");

  const { data: existing } = await supabase
    .from("vehicle_photos")
    .select("sort_order, is_cover")
    .eq("vehicle_id", vehicleId)
    .order("sort_order", { ascending: false });
  const next = (existing?.[0]?.sort_order ?? -1) + 1;
  const hasCover = existing?.some((p) => p.is_cover) ?? false;
  const { error } = await supabase.from("vehicle_photos").insert({
    vehicle_id: vehicleId,
    storage_path: storagePath,
    sort_order: next,
    is_cover: !hasCover,
  });
  if (error) throw new Error(dbMessage(error));
  refreshPublic();
  revalidatePath(`/admin/vehiculos/${vehicleId}`);
}

async function photoVehicle(supabase: Awaited<ReturnType<typeof createSessionClient>>, photoId: string) {
  uuid.parse(photoId);
  const { data, error } = await supabase
    .from("vehicle_photos")
    .select("id, vehicle_id, storage_path, is_cover")
    .eq("id", photoId)
    .single();
  if (error || !data) throw new Error("사진을 찾을 수 없습니다.");
  return data;
}

export async function setCoverPhoto(photoId: string) {
  const { supabase } = await requireAdmin();
  const photo = await photoVehicle(supabase, photoId);
  await supabase.from("vehicle_photos").update({ is_cover: false }).eq("vehicle_id", photo.vehicle_id).eq("is_cover", true);
  const { error } = await supabase.from("vehicle_photos").update({ is_cover: true }).eq("id", photoId);
  if (error) throw new Error(dbMessage(error));
  refreshPublic();
  revalidatePath(`/admin/vehiculos/${photo.vehicle_id}`);
}

export async function movePhoto(photoId: string, direction: "up" | "down") {
  const { supabase } = await requireAdmin();
  const photo = await photoVehicle(supabase, photoId);
  const { data: list } = await supabase
    .from("vehicle_photos")
    .select("id, sort_order")
    .eq("vehicle_id", photo.vehicle_id)
    .order("sort_order")
    .order("created_at");
  if (!list) return;
  const idx = list.findIndex((p) => p.id === photoId);
  const swap = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swap < 0 || swap >= list.length) return;
  [list[idx], list[swap]] = [list[swap], list[idx]];
  // 순서를 0..n 으로 다시 매긴다
  for (let i = 0; i < list.length; i++) {
    const { error } = await supabase.from("vehicle_photos").update({ sort_order: i }).eq("id", list[i].id);
    if (error) throw new Error(dbMessage(error));
  }
  refreshPublic();
  revalidatePath(`/admin/vehiculos/${photo.vehicle_id}`);
}

export async function updatePhotoAlt(photoId: string, alt: string) {
  const { supabase } = await requireAdmin();
  const photo = await photoVehicle(supabase, photoId);
  const value = alt.trim().slice(0, 200) || null;
  const { error } = await supabase.from("vehicle_photos").update({ alt: value }).eq("id", photoId);
  if (error) throw new Error(dbMessage(error));
  refreshPublic();
  revalidatePath(`/admin/vehiculos/${photo.vehicle_id}`);
}

export async function setPhotoReference(photoId: string, isReference: boolean) {
  const { supabase } = await requireAdmin();
  const photo = await photoVehicle(supabase, photoId);
  const { error } = await supabase.from("vehicle_photos").update({ is_reference: isReference }).eq("id", photoId);
  if (error) throw new Error(dbMessage(error));
  refreshPublic();
  revalidatePath(`/admin/vehiculos/${photo.vehicle_id}`);
}

export async function deletePhoto(photoId: string) {
  const { supabase } = await requireAdmin();
  const photo = await photoVehicle(supabase, photoId);
  const { error } = await supabase.from("vehicle_photos").delete().eq("id", photoId);
  if (error) throw new Error(dbMessage(error));
  await supabase.storage.from(PHOTO_BUCKET).remove([photo.storage_path]);
  if (photo.is_cover) {
    const { data: first } = await supabase
      .from("vehicle_photos")
      .select("id")
      .eq("vehicle_id", photo.vehicle_id)
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    if (first) await supabase.from("vehicle_photos").update({ is_cover: true }).eq("id", first.id);
  }
  refreshPublic();
  revalidatePath(`/admin/vehiculos/${photo.vehicle_id}`);
}

// ── 인도 체크리스트 ───────────────────────────────────────────────────────
const checkSchema = z.object({
  vehicle_id: uuid,
  item_id: uuid,
  status: z.enum(["unchecked", "provided", "not_provided"]),
  note: z.string().trim().max(500).optional(),
});

export async function saveHandoverCheck(input: z.input<typeof checkSchema>) {
  const { supabase, user } = await requireAdmin();
  const d = checkSchema.parse(input);
  const { error } = await supabase.from("vehicle_handover_checks").upsert({
    vehicle_id: d.vehicle_id,
    item_id: d.item_id,
    status: d.status,
    note: d.note || null,
    checked_by: d.status === "unchecked" ? null : user.id,
    checked_at: d.status === "unchecked" ? null : new Date().toISOString(),
  });
  if (error) throw new Error(dbMessage(error));
  revalidatePath(`/admin/vehiculos/${d.vehicle_id}`);
}

// ── 문의 ────────────────────────────────────────────────────────────────
const inquiryUpdate = z.object({
  id: uuid,
  status: z.enum(["new", "reviewing", "contacted", "contracting", "closed"]),
  admin_note: z.string().trim().max(2000).transform((v) => v || null),
});

export async function updateInquiry(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = inquiryUpdate.safeParse({
    id: fd.get("id"),
    status: fd.get("status"),
    admin_note: String(fd.get("admin_note") ?? ""),
  });
  if (!parsed.success) return { ok: false, errors: flattenErrors(parsed.error), message: "입력 오류" };
  const { id, ...patch } = parsed.data;
  const { error } = await supabase.from("inquiries").update(patch).eq("id", id);
  if (error) return { ok: false, errors: {}, message: dbMessage(error) };
  revalidatePath("/admin", "layout");
  return { ok: true, errors: {}, message: "저장됨" };
}

// ── 사업 설정 ─────────────────────────────────────────────────────────────
export async function saveSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const s = (k: string) => String(fd.get(k) ?? "");
  const parsed = settingsSchema.safeParse({
    business_name: s("business_name"),
    whatsapp_number: s("whatsapp_number"),
    phone: s("phone"),
    email: s("email"),
    address: s("address"),
    instagram_url: s("instagram_url"),
    site_domain: s("site_domain"),
    currency: s("currency"),
    default_iva_rate: s("default_iva_rate"),
    default_iva_applies: fd.get("default_iva_applies") === "on",
    iva_verified: fd.get("iva_verified") === "on",
    inquiry_notice: s("inquiry_notice"),
    support_hours: s("support_hours"),
    insurance_status: s("insurance_status"),
    insurance_provider: s("insurance_provider"),
    insurance_note: s("insurance_note"),
  });
  if (!parsed.success) return { ok: false, errors: flattenErrors(parsed.error), message: "입력 내용을 확인해 주세요." };
  const { error } = await supabase.from("settings").update(parsed.data).eq("id", 1);
  if (error) return { ok: false, errors: {}, message: dbMessage(error) };
  refreshPublic();
  return { ok: true, errors: {}, message: "설정이 저장되었습니다." };
}

const logoPath = /^logo\/[0-9a-f-]{36}\.(png|svg|webp|jpg|jpeg)$/;

export async function setLogo(path: string | null) {
  const { supabase } = await requireAdmin();
  if (path !== null && !logoPath.test(path)) throw new Error("잘못된 로고 경로입니다.");
  const { data: current } = await supabase.from("settings").select("logo_path").eq("id", 1).single();
  const { error } = await supabase.from("settings").update({ logo_path: path }).eq("id", 1);
  if (error) throw new Error(dbMessage(error));
  if (current?.logo_path && current.logo_path !== path) {
    await supabase.storage.from(BRANDING_BUCKET).remove([current.logo_path]);
  }
  refreshPublic();
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
