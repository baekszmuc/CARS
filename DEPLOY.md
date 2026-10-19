# BS CARS 배포 및 운영 안내

이 문서는 실제 운영 환경(Supabase + Vercel) 배포와 일상 운영 방법을 안내합니다.
**아래 1~4단계는 운영자 계정이 필요하므로 직접 진행해야 합니다.** (개발 단계에서는 Supabase·Vercel 계정, 도메인, WhatsApp 번호가 제공되지 않아 공개 배포는 하지 않았습니다.)

---

## 1. Supabase 프로젝트 생성 및 DB 설정

1. https://supabase.com 에서 새 프로젝트 생성 — Region은 **South America (São Paulo)** 권장 (파라과이와 가장 가까움).
2. 데이터베이스 비밀번호를 안전하게 보관합니다.
3. 로컬에서 마이그레이션 적용:
   ```bash
   npx supabase login
   npx supabase link --project-ref <프로젝트-REF>
   npm run db:push
   ```
   → 테이블·RLS 정책·Storage 버킷(`vehicle-photos`, `branding`)과 **초기 차량 3종(Tivoli 2023 / Kia Seltos / Tucson)**, 인수 품목 목록이 등록됩니다.
   (CLI를 쓸 수 없다면 Supabase 대시보드 → SQL Editor 에서 `supabase/migrations/` 의 두 파일을 순서대로 실행해도 됩니다.)
4. **Authentication → Sign In / Providers → "Allow new users to sign up" 끄기** (관리자 계정은 스크립트로만 생성).
5. Project Settings → API 에서 다음 값을 확인합니다.
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon / publishable key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role / secret key → `SUPABASE_SERVICE_ROLE_KEY` (**관리자 생성 스크립트에서만 사용, 절대 공개 금지**)

## 2. 관리자 계정 생성

`.env.local` 에 운영 Supabase 값 3개를 넣은 뒤:

```bash
npm run admin:create -- 운영자이메일@example.com '10자-이상-강력한-비밀번호'
```

- 이미 있는 계정 이메일을 넣으면 해당 계정에 관리자 권한만 부여합니다.
- 관리자를 해제하려면 Supabase SQL Editor에서: `delete from public.admins where user_id = (select id from auth.users where email = '...');`
- 로그인: `https://<사이트주소>/admin/login`

## 3. Vercel 배포

1. 이 프로젝트를 GitHub 저장소에 올립니다.
2. https://vercel.com → Add New Project → 저장소 선택 (Framework: Next.js 자동 인식).
3. Environment Variables 에 등록:
   | 이름 | 값 |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |
   | `NEXT_PUBLIC_SITE_URL` | 임시 주소, 예: `https://bs-cars.vercel.app` |

   `SUPABASE_SERVICE_ROLE_KEY` 는 Vercel에 **등록하지 않습니다** (앱에서 사용하지 않음).
4. Deploy. 빌드 중 DB에서 설정을 읽으므로 Supabase 설정(1단계)이 먼저 끝나 있어야 합니다.
5. Supabase → Authentication → URL Configuration → Site URL 에 배포 주소를 입력합니다.

배포 직후 확인:
- [ ] `https://<주소>/` 와 `/vehiculos` 에서 차량 3종과 가격(USD 800/80/880, 900/90/990, 1,100/110/1,210) 표시
- [ ] `/vehiculos/tivoli-2023`, `/vehiculos/kia-seltos`, `/vehiculos/tucson` 직접 접속 및 새로고침
- [ ] `/admin` 접속 시 로그인 화면으로 이동, 로그인 후 대시보드 표시
- [ ] 문의 양식 제출 후 관리자 → 고객 문의 목록에 표시
- [ ] 관리자에서 사진 업로드 후 고객 페이지에 표시

## 4. 실제 도메인 연결

1. Vercel → Project → Settings → Domains 에서 도메인 추가 (예: `bscars.com.py`, `www.bscars.com.py`).
2. 도메인 등록 업체의 DNS에 Vercel이 안내하는 레코드(A `76.76.21.21` 또는 CNAME `cname.vercel-dns.com`)를 추가합니다. HTTPS 인증서는 자동 발급됩니다.
3. 연결이 확인되면 **관리자 → 사업 설정 → "웹사이트 도메인"** 에 `https://www.도메인` 을 입력하고 저장합니다.
   - 이때부터 모든 공유 링크·WhatsApp 메시지·SEO 메타데이터·sitemap이 실제 도메인을 사용합니다.
   - 도메인을 입력하기 전에는 링크가 임시 주소로 생성되며, 관리자 화면에 "임시 주소" 경고가 표시되고 검색엔진 노출(robots)이 차단됩니다.
4. Vercel 환경 변수 `NEXT_PUBLIC_SITE_URL` 도 실제 도메인으로 바꾸고 재배포하면 좋습니다(선택).
5. Supabase → Authentication → URL Configuration → Site URL 도 실제 도메인으로 변경합니다.

## 5. WhatsApp 설정

관리자 → 사업 설정 → **WhatsApp 번호** 에 국가번호를 포함한 숫자만 입력합니다.
- 예: 휴대폰 `0981 123 456` → `595981123456` (앞의 0 제거, 595 추가)
- 저장하면 모든 차량 상세 페이지·비교표·홈 상담 섹션에 WhatsApp 문의 버튼이 나타납니다.
- 번호가 비어 있거나 형식이 틀리면 버튼 대신 "WhatsApp 상담 번호를 준비 중입니다" 안내가 표시됩니다 (잘못된 링크는 만들지 않음).
- 차량별 메시지는 DB의 차량명·가격·실제 차량 URL로 자동 작성됩니다. 관리자 → 차량 수정 → "고객 문의 메시지 확인" 버튼으로 실제 메시지를 미리 볼 수 있습니다.

## 6. 차량 추가 및 가격 수정

**차량 추가**: 관리자 → 차량 관리 → `+ 차량 추가`
- 차량명, 연식(모르면 비움), 주행거리, 기본 렌트료(IVA 별도), 과금 단위, IVA 적용·세율 입력
- URL 주소(slug)를 비워 두면 `차량명-연식` 으로 자동 생성되며, 이미 있는 주소면 고유 식별자가 붙습니다.
- "고객용 사이트에 게시" 를 체크하면 즉시 공개됩니다. 등록 후 사진 업로드와 인도 체크리스트를 진행하세요.

**가격 수정**: 차량 관리 → 차량 `수정` → 기본 렌트료 / IVA 세율 / 과금 단위 변경 → `변경 사항 저장`
- IVA 금액과 IVA 포함 금액은 자동 계산되며 저장 즉시 고객용 사이트 전체에 반영됩니다.
- 실제 계약의 과금 단위가 월이 아니라면 과금 단위(일/주/월/연)를 바꾸세요. 화면 표기("/ 월" 등)와 WhatsApp 메시지가 함께 바뀝니다.

**사양**: 차량 수정 → "차량 사양"에 한 줄에 하나씩 `항목: 값` 형식으로 입력합니다. 비교표는 같은 항목명(엔진, 출력, 토크, 변속기, 구동 방식, 연료, 승차 정원, 전장 등)끼리 나란히 비교합니다.

**사진**: 차량 수정 화면 → `사진 업로드` (JPG/PNG/WEBP/AVIF, 장당 8MB 이하). ←/→ 로 순서 변경, `대표로 설정` 으로 대표 사진 지정. 대표 사진은 카드·상세·SNS 공유 이미지에 사용됩니다. 실제 해당 차량 사진만 올려 주세요.

**게시 중단 / 보관 / 삭제**
- 게시 중단: 공개 카탈로그와 상세 URL(404)에서 즉시 제외, 관리자에서는 계속 수정 가능
- 보관: 운영 목록에서 숨기고 게시 중단 (이력 보존용, 언제든 해제 가능)
- 영구 삭제: 차량과 사진 삭제 (고객 문의 기록의 차량명은 유지)

**URL 변경 주의**: 이미 공유된 링크가 있는 차량의 URL 주소를 바꾸면 기존 링크는 열리지 않습니다.

## 7. 운영 전 확인이 필요한 항목 (임의로 작성하지 않은 정보)

| 항목 | 현재 상태 | 설정 위치 |
| --- | --- | --- |
| 로고 | 와이드 기하학 서체(Syncopate) 워드마크로 재현 — 원본 로고 파일 업로드 권장 | 사업 설정 → 로고 |
| 브랜드 서체 TT Interphases | 상용 서체라 미포함, 형태가 가까운 Inter로 대체 | `public/fonts` + `globals.css` 주석 해제 |
| 전화번호·이메일·주소·Instagram | 비어 있음 ("준비 중" 표시) | 사업 설정 |
| WhatsApp 번호 | 비어 있음 | 사업 설정 |
| 실제 도메인 | 미등록 (임시 주소) | 4단계 + 사업 설정 |
| IVA 적용 여부·세율 | 10% 적용 (사용자 제공 가격), "확인됨" 미체크 | 차량별 수정 / 사업 설정 |
| 보험 상태 | "보험 제안서 검토 단계" (Royal Seguros) | 사업 설정 → 보험 |
| 전화 기술 지원 업무시간 | "확인 후 안내" | 사업 설정 |
| 차량 연식·사양 | Seltos 2027, Tucson 2026 및 사양은 제공된 조사 자료 기준 (사양 출처 문구 표시) | 차량 수정 → 차량 사양 |
| 차량 사진 | "실제 차량 사진 준비 중" 영역 | 차량 수정 → 사진 |
| 부속서 C 정비 주기 세부 항목 | 원문 미제공으로 미작성 | `src/content/services.ts` |
| 개인정보 처리방침 | 일반 문안 — 법률 검토 권장 | `src/app/(site)/privacidad/page.tsx` |

## 8. 백업 및 복구

- Supabase 유료 플랜은 일일 자동 백업(Pro: 7일 보관, PITR 옵션)을 제공합니다. 운영 시 Pro 이상을 권장합니다.
- 수동 백업: `npx supabase db dump --linked -f backup.sql` (스키마) / `npx supabase db dump --linked --data-only -f data.sql` (데이터)
- 복구: 새 프로젝트에 `npm run db:push` 후 `psql <연결문자열> -f data.sql`
- 사진은 Storage 버킷 `vehicle-photos`, `branding` 에 저장됩니다. 필요 시 Supabase 대시보드 또는 S3 호환 API로 내려받아 보관하세요.
- 스키마 변경은 항상 `supabase/migrations/` 에 새 파일로 추가하고 `npm run db:push` 로 적용합니다.

## 9. 알려진 제한 사항

- 날짜별 예약(재고) 시스템은 구현되어 있지 않습니다. 문의 양식은 문의만 접수하며, 고객 화면에 "예약이 확정되지 않습니다 / 이용 가능 여부는 별도 확인" 안내가 표시됩니다.
- 문의 양식의 스팸 방지는 숨김 필드(honeypot)만 적용되어 있습니다. 스팸이 많아지면 Cloudflare Turnstile 등 CAPTCHA 추가를 권장합니다.
- 새 문의 알림(이메일·WhatsApp 자동 발송)은 구현되어 있지 않습니다. 관리자 대시보드에서 확인합니다.
- 다국어: 문구가 `src/i18n/ko.ts` 에 모여 있어 스페인어(`es.ts`) 추가가 가능한 구조이나, 현재는 한국어만 제공하며 언어 전환 버튼은 표시하지 않습니다.
- 사진 버킷은 공개(public) 버킷이므로, 비공개 차량의 사진도 파일 주소를 정확히 알면 열람 가능합니다(주소는 추측 불가능한 UUID).

## 10. 디자인 미리보기 만들기

로컬에서 사이트를 실행한 상태에서 `npm run preview:snapshot -- 출력폴더` 를 실행하면, 공개 페이지와 관리자 화면(읽기 전용)을 정적 HTML로 내보냅니다. 배포 전에 디자인을 공유할 때 사용합니다.
