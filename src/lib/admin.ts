import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * 관리자 권한 확인. 로그인하지 않았으면 로그인 화면으로 보내고,
 * 로그인했지만 admins 테이블에 없으면 { isAdmin: false } 를 돌려준다.
 */
export async function getAdminContext() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error) throw new Error(`관리자 권한 확인 실패: ${error.message}`);
  return { supabase, user, isAdmin: Boolean(isAdmin) };
}

/** 서버 액션 전용: 관리자가 아니면 예외를 던진다 (DB RLS가 한 번 더 차단). */
export async function requireAdmin() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new Error("관리자 권한이 없습니다.");
  return { supabase, user };
}
