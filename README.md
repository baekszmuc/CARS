# BS CARS — 차량 렌탈 카탈로그 웹 애플리케이션

파라과이 차량 렌탈 사업 **BS CARS**의 운영용 웹사이트입니다.
고객은 차량을 비교하고 가격·포함 서비스를 확인하며 차량별 고유 링크를 공유하고 렌탈 문의를 제출할 수 있습니다.
관리자는 코드 수정 없이 차량·가격·사진·게시 상태·고객 문의·사업 정보를 관리합니다.

- 기술 스택: Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (PostgreSQL / Auth / Storage) · Vercel
- 운영·배포 절차: **[DEPLOY.md](./DEPLOY.md)** (배포, 관리자 계정, 도메인, WhatsApp, 차량·가격 수정 안내)

## 페이지

| 경로 | 내용 |
| --- | --- |
| `/` | 홈 (히어로, 차량 카드, 포함 서비스 요약, 인수 품목 요약, 상담) |
| `/vehiculos` | 전체 차량 + 비교표 (`#comparar`, 모바일은 카드형) |
| `/vehiculos/[slug]` | 차량 상세 (공통 템플릿 + 동적 라우팅, SEO/OG 메타데이터 자동 생성) |
| `/servicios` | 렌트료에 포함된 서비스 |
| `/incluye` | 차량 인수 시 함께 제공되는 항목 |
| `/contacto` | 렌탈 문의 양식 (DB 저장) |
| `/privacidad` | 개인정보 처리방침 |
| `/admin` | 관리자 (대시보드 · 차량 관리 · 고객 문의 · 사업 설정) |

## 로컬 개발

필요: Node.js 20+, Docker (로컬 Supabase용)

```bash
npm install
npm run db:start          # 로컬 Supabase 실행 + 마이그레이션(초기 차량 3종 포함) 적용
cp .env.example .env.local # db:start 출력의 API URL / anon key / service_role key 입력
npm run admin:create -- admin@example.com '충분히-긴-비밀번호'
npm run dev               # http://localhost:3000
```

## 테스트

```bash
npm run typecheck && npm run lint
npm run build && npx next start -p 3000   # 별도 터미널
set -a; . ./.env.local; set +a; npm run test:e2e
```

E2E 테스트(`tests/e2e`)는 실제 로컬 Supabase와 프로덕션 빌드를 대상으로 요구사항의 14개 테스트 항목을 검증합니다.
테스트용 관리자 계정은 `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` (기본: `admin@bscars.local` / `TestPassword123!`)로 지정합니다.

## 구조

```
supabase/migrations/      DB 스키마, RLS 정책, Storage 버킷, 초기 데이터(차량 3종·인수 품목)
src/app/(site)/           고객용 페이지
src/app/admin/            관리자 페이지 + 서버 액션(actions.ts)
src/app/og/[slug]/        사진이 없는 차량의 SNS 공유 이미지
src/components/           UI 컴포넌트 (admin/ 은 관리자 전용)
src/content/services.ts   포함 서비스 문구 (사용자 제공 범위 그대로)
src/i18n/                 한국어 문구 사전 (다국어 확장 구조, 현재 한국어만 제공)
src/lib/                  데이터 조회, 가격 포맷, URL 생성, WhatsApp 메시지, 입력값 검증
scripts/create-admin.mjs  관리자 계정 생성
```

## 핵심 설계

- **가격**: DB에는 기본 렌트료·IVA 적용 여부·세율만 저장하고, IVA 금액과 IVA 포함 금액은 Postgres 생성 컬럼으로 계산 → 화면 간 불일치가 생길 수 없음.
- **자동 URL**: 차량 INSERT 시 DB 트리거가 `이름-연식` slug를 생성하고 중복이면 `-a1b2c3` 같은 식별자를 덧붙임. `slug`에 UNIQUE 제약.
- **보안**: 모든 테이블 RLS. 공개(anon)는 게시 차량·설정 조회와 문의 등록(INSERT)만 가능. 관리자 여부는 `admins` 테이블 + `is_admin()` 함수로 판정. service_role 키는 앱 코드에서 사용하지 않음.
- **즉시 반영**: 관리자 저장 시 `revalidatePath`로 고객용 페이지 캐시를 무효화 (그 외에는 5분 ISR 캐시).
