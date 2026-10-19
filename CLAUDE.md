# BS CARS — 작업 안내 (Claude Code 세션용)

파라과이 차량 렌탈 카탈로그. Next.js 15 (App Router) · TypeScript · Tailwind 4 · Supabase (Postgres/Auth/Storage) · Vercel.
고객·관리자 UI는 모두 한국어. 상세 구조는 README.md, 운영·배포 절차는 DEPLOY.md.

## 반드시 지킬 원칙
- 사용자가 제공하지 않은 사업 정보(전화, 이메일, 주소, 도메인, 계약 조건)·차량 사양을 만들어 넣지 않는다.
- 초기 가격은 바꾸지 않는다: Tivoli 2023 USD 800/80/880, Kia Seltos 2027 USD 900/90/990, Tucson 2026 USD 1,100/110/1,210 (월, IVA 10%).
- 실제 차량이 아닌 사진은 `vehicle_photos.is_reference = true` (화면에 "참고 이미지" 표시). Seltos·Tucson 사진은 참고 이미지, Tivoli 사진은 실제 차량.
- 서비스 권한 키(service_role / secret)는 앱 코드·Vercel·커밋에 넣지 않는다. 관리자 생성 스크립트에서만 사용.

## 명령
```bash
npm run db:start            # 로컬 Supabase (Docker 필요: 없으면 `dockerd &` 로 데몬 실행)
npm run admin:create -- 이메일 비밀번호
npm run build && npx next start -p 3000
set -a; . ./.env.local; set +a; npm run test:e2e   # E2E 13개 (요구사항 14개 항목)
npm run typecheck && npm run lint
npm run preview:snapshot -- 출력폴더               # 정적 디자인 미리보기 내보내기
```
.env.local 은 커밋하지 않는다 (.env.example 참고).

## 다음 할 일: 운영 배포 ("BS CARS 배포해줘")
환경에 `SUPABASE_ACCESS_TOKEN`, `VERCEL_TOKEN` 이 있고 supabase.com / supabase.co / vercel.com 네트워크가 허용되어 있어야 한다. 없으면 사용자에게 환경 설정을 요청하고 토큰을 채팅으로 받지 않는다.

1. Supabase 프로젝트 생성 (리전: South America São Paulo, `sa-east-1`). Supabase CLI(`npx supabase`)는 `SUPABASE_ACCESS_TOKEN` 을 사용한다.
   - 사용자가 이미 대시보드에서 프로젝트를 만들었는지 먼저 `npx supabase projects list` 로 확인한다.
2. `npx supabase link --project-ref <ref>` 후 `npm run db:push` (supabase/migrations 4개 적용: 스키마·RLS·버킷·초기 차량 3종·인수 품목·사양·참고 이미지 플래그).
3. Auth: 공개 회원가입 끄기, Site URL 을 배포 주소로.
4. 관리자 계정: 사용자에게 관리자 이메일을 묻고, 비밀번호는 사용자가 직접 정하도록 한다 (대시보드 Authentication → Add user 후 `insert into public.admins ...`, 또는 admin:create 스크립트).
5. Vercel 배포 (`npx vercel --token $VERCEL_TOKEN`): 환경 변수는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`(배포 주소) 3개만. 빌드 시 DB 를 읽으므로 2번이 먼저 끝나야 한다.
6. 배포 주소에 대해 E2E 실행: `E2E_BASE_URL=https://... E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... npm run test:e2e` — 테스트가 차량 추가·삭제, WhatsApp 번호 임시 설정 후 원복, 문의 1건 생성을 하므로 실행 전에 사용자에게 알린다.
7. 차량 사진 업로드: `assets/vehicle-photos/{tivoli-2023,kia-seltos,tucson}` (파일명 순서 = 표시 순서, 01 이 대표 사진). 관리자 화면에서 업로드하거나 관리자 세션으로 Storage 업로드 후 `vehicle_photos` 등록. Seltos·Tucson 은 is_reference = true.

## 미정 사항 (사용자 확인 필요)
WhatsApp 번호, 전화, 이메일, 주소, Instagram, 실제 도메인, 지원 업무시간, 보험 계약 상태, IVA 확인 여부, 부속서 C 정비 주기, TT Interphases 서체 파일(현재 Inter 대체).
