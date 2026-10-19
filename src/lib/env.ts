function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `환경 변수 ${name} 이(가) 설정되지 않았습니다. .env.example 을 참고해 .env.local 또는 Vercel 환경 변수를 설정하세요.`,
    );
  }
  return value;
}

// NEXT_PUBLIC_ 값은 빌드 시 인라인되므로 process.env.X 형태로 직접 참조해야 한다.
export const SUPABASE_URL = required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
export const SUPABASE_ANON_KEY = required(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const PHOTO_BUCKET = "vehicle-photos";
export const BRANDING_BUCKET = "branding";

export function publicStorageUrl(bucket: string, path: string): string {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encoded}`;
}
