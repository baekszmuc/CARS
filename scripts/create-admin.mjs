#!/usr/bin/env node
/**
 * 관리자 계정 생성 / 기존 계정에 관리자 권한 부여
 *
 *   npm run admin:create -- 이메일 비밀번호
 *
 * SUPABASE_SERVICE_ROLE_KEY 가 필요합니다 (서버 전용 키 — 이 스크립트에서만 사용).
 */
import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !password) {
  console.error("사용법: npm run admin:create -- 이메일 비밀번호");
  process.exit(1);
}
if (password.length < 10) {
  console.error("비밀번호는 10자 이상으로 설정하세요.");
  process.exit(1);
}
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 환경 변수가 필요합니다 (.env.local).");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

let userId;
const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
if (created.error) {
  // 이미 존재하는 사용자면 찾아서 권한만 부여
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const existing = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!existing) {
    console.error("사용자 생성 실패:", created.error.message);
    process.exit(1);
  }
  userId = existing.id;
  console.log("기존 사용자에게 관리자 권한을 부여합니다:", email);
} else {
  userId = created.data.user.id;
  console.log("사용자를 생성했습니다:", email);
}

const { error } = await supabase.from("admins").upsert({ user_id: userId });
if (error) {
  console.error("관리자 등록 실패:", error.message);
  process.exit(1);
}
console.log("완료 — /admin/login 에서 로그인하세요.");
