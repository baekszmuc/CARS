import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * 쿠키를 사용하지 않는 공개(anon) 클라이언트.
 * 고객용 페이지에서 사용하며 RLS 정책상 게시된 차량만 조회된다.
 */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
