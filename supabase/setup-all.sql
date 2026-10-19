-- BS CARS 전체 DB 설정 (Supabase 대시보드 → SQL Editor 에 붙여넣고 Run)
-- supabase/migrations/ 의 파일을 순서대로 합친 것입니다. 새 프로젝트에서 한 번만 실행하세요.

-- ===== 20261019000001_schema.sql =====
-- BS CARS — 기본 스키마
-- 차량, 사진, 사업 설정, 고객 문의, 인수 품목, 관리자 권한

create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------------------
-- 관리자
-- ---------------------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create policy "admins: 본인 행 조회" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 공통: updated_at 자동 갱신
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 사업 설정 (단일 행)
-- ---------------------------------------------------------------------------
create table public.settings (
  id smallint primary key default 1 check (id = 1),
  business_name text not null default 'BS CARS' check (char_length(business_name) between 1 and 80),
  logo_path text,
  whatsapp_number text check (whatsapp_number is null or whatsapp_number ~ '^[0-9]{8,15}$'),
  phone text check (phone is null or char_length(phone) <= 40),
  email text check (email is null or char_length(email) <= 120),
  address text check (address is null or char_length(address) <= 300),
  instagram_url text check (instagram_url is null or instagram_url ~ '^https://'),
  site_domain text check (site_domain is null or site_domain ~ '^https?://[^/\s]+$'),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  default_iva_rate numeric(5, 2) not null default 10 check (default_iva_rate >= 0 and default_iva_rate <= 100),
  default_iva_applies boolean not null default true,
  iva_verified boolean not null default false,
  inquiry_notice text check (inquiry_notice is null or char_length(inquiry_notice) <= 1000),
  support_hours text check (support_hours is null or char_length(support_hours) <= 200),
  insurance_status text not null default 'proposal'
    check (insurance_status in ('not_set', 'proposal', 'active')),
  insurance_provider text default 'Royal Seguros' check (insurance_provider is null or char_length(insurance_provider) <= 120),
  insurance_note text check (insurance_note is null or char_length(insurance_note) <= 1000),
  updated_at timestamptz not null default now()
);

create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

alter table public.settings enable row level security;

create policy "settings: 공개 조회" on public.settings
  for select to anon, authenticated using (true);
create policy "settings: 관리자 수정" on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 차량
-- ---------------------------------------------------------------------------
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  name text not null check (char_length(name) between 1 and 80),
  model_year smallint check (model_year is null or model_year between 1950 and 2100),
  mileage_km integer check (mileage_km is null or mileage_km >= 0),
  base_price numeric(12, 2) not null check (base_price >= 0),
  iva_applies boolean not null default true,
  iva_rate numeric(5, 2) not null default 10 check (iva_rate >= 0 and iva_rate <= 100),
  iva_amount numeric(12, 2) generated always as (
    case when iva_applies then round(base_price * iva_rate / 100, 2) else 0 end
  ) stored,
  total_price numeric(12, 2) generated always as (
    base_price + case when iva_applies then round(base_price * iva_rate / 100, 2) else 0 end
  ) stored,
  billing_unit text not null default 'month' check (billing_unit in ('day', 'week', 'month', 'year')),
  status text not null default 'available'
    check (status in ('available', 'reserved', 'rented', 'maintenance', 'unavailable')),
  description text check (description is null or char_length(description) <= 4000),
  is_published boolean not null default false,
  is_archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint archived_not_published check (not (is_archived and is_published))
);

create index vehicles_public_idx on public.vehicles (is_published, is_archived, sort_order);

-- slug 생성: 이름(+연식) → 소문자, 악센트 제거, 영숫자 외 '-' 치환
create or replace function public.slugify(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(
    lower(extensions.unaccent(coalesce(value, ''))),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

-- INSERT 시 slug가 비어 있으면 자동 생성. 중복이면 고유 식별자를 덧붙인다.
create or replace function public.vehicles_assign_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  candidate text;
  base text;
begin
  if new.slug is null or btrim(new.slug) = '' then
    base := public.slugify(new.name || coalesce(' ' || new.model_year::text, ''));
  else
    base := public.slugify(new.slug);
  end if;
  if base = '' then
    base := 'vehiculo';
  end if;
  base := left(base, 70);
  candidate := base;
  while exists (select 1 from public.vehicles v where v.slug = candidate and v.id <> new.id) loop
    candidate := base || '-' || substr(md5(gen_random_uuid()::text), 1, 6);
  end loop;
  new.slug := candidate;
  return new;
end;
$$;

create trigger vehicles_slug before insert on public.vehicles
  for each row execute function public.vehicles_assign_slug();

-- UPDATE 시 slug를 명시적으로 바꾼 경우에만 정규화(중복은 unique 제약으로 거부)
create or replace function public.vehicles_normalize_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.slug is distinct from old.slug then
    new.slug := public.slugify(new.slug);
    if new.slug = '' then
      raise exception 'slug는 비워 둘 수 없습니다';
    end if;
  end if;
  return new;
end;
$$;

create trigger vehicles_slug_update before update of slug on public.vehicles
  for each row execute function public.vehicles_normalize_slug();

create trigger vehicles_touch before update on public.vehicles
  for each row execute function public.touch_updated_at();

alter table public.vehicles enable row level security;

create policy "vehicles: 게시 차량 공개 조회" on public.vehicles
  for select to anon, authenticated using (is_published and not is_archived);
create policy "vehicles: 관리자 조회" on public.vehicles
  for select to authenticated using (public.is_admin());
create policy "vehicles: 관리자 추가" on public.vehicles
  for insert to authenticated with check (public.is_admin());
create policy "vehicles: 관리자 수정" on public.vehicles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "vehicles: 관리자 삭제" on public.vehicles
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 차량 사진
-- ---------------------------------------------------------------------------
create table public.vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  storage_path text not null unique,
  alt text check (alt is null or char_length(alt) <= 200),
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index vehicle_photos_vehicle_idx on public.vehicle_photos (vehicle_id, sort_order);
create unique index vehicle_photos_one_cover on public.vehicle_photos (vehicle_id) where is_cover;

alter table public.vehicle_photos enable row level security;

create policy "photos: 게시 차량 사진 공개 조회" on public.vehicle_photos
  for select to anon, authenticated using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.is_published and not v.is_archived
    )
  );
create policy "photos: 관리자 전체" on public.vehicle_photos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 차량 인수 품목 (계약상 기본 제공 목록) / 차량별 실제 인도 체크리스트
-- ---------------------------------------------------------------------------
create table public.handover_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('documents', 'equipment', 'keys')),
  label text not null,
  original_term text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

alter table public.handover_items enable row level security;

create policy "handover_items: 공개 조회" on public.handover_items
  for select to anon, authenticated using (is_active or public.is_admin());
create policy "handover_items: 관리자 전체" on public.handover_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 상태: unchecked(미확인) / provided(제공 확인) / not_provided(제공 안 됨)
create table public.vehicle_handover_checks (
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  item_id uuid not null references public.handover_items (id) on delete cascade,
  status text not null default 'unchecked' check (status in ('unchecked', 'provided', 'not_provided')),
  note text check (note is null or char_length(note) <= 500),
  checked_by uuid references auth.users (id) on delete set null,
  checked_at timestamptz,
  primary key (vehicle_id, item_id)
);

alter table public.vehicle_handover_checks enable row level security;

create policy "handover_checks: 관리자 전체" on public.vehicle_handover_checks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 고객 문의
-- ---------------------------------------------------------------------------
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  phone text not null check (char_length(phone) between 5 and 40),
  email text check (email is null or (char_length(email) <= 120 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  vehicle_id uuid references public.vehicles (id) on delete set null,
  vehicle_name text check (vehicle_name is null or char_length(vehicle_name) <= 120),
  pickup_date date,
  return_date date,
  message text check (message is null or char_length(message) <= 2000),
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'contacted', 'contracting', 'closed')),
  admin_note text check (admin_note is null or char_length(admin_note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inquiry_dates check (return_date is null or pickup_date is null or return_date >= pickup_date)
);

create index inquiries_created_idx on public.inquiries (created_at desc);

create trigger inquiries_touch before update on public.inquiries
  for each row execute function public.touch_updated_at();

-- 고객이 지정한 차량명은 신뢰하지 않고, 실제 게시 차량의 이름으로 기록한다.
create or replace function public.inquiries_snapshot_vehicle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.vehicle_id is not null then
    select v.name || coalesce(' ' || v.model_year::text, '')
      into new.vehicle_name
      from public.vehicles v
     where v.id = new.vehicle_id and v.is_published and not v.is_archived;
    if new.vehicle_name is null then
      new.vehicle_id := null;
    end if;
  else
    new.vehicle_name := null;
  end if;
  return new;
end;
$$;

create trigger inquiries_snapshot before insert on public.inquiries
  for each row execute function public.inquiries_snapshot_vehicle();

alter table public.inquiries enable row level security;

-- 고객은 '신규' 상태로만 문의를 추가할 수 있고, 조회·수정은 불가
create policy "inquiries: 고객 문의 등록" on public.inquiries
  for insert to anon, authenticated
  with check (status = 'new' and admin_note is null);
create policy "inquiries: 관리자 조회" on public.inquiries
  for select to authenticated using (public.is_admin());
create policy "inquiries: 관리자 수정" on public.inquiries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "inquiries: 관리자 삭제" on public.inquiries
  for delete to authenticated using (public.is_admin());

-- 기본 권한 정리: anon은 inquiries에 INSERT만
revoke all on public.inquiries from anon;
grant insert on public.inquiries to anon;

-- ---------------------------------------------------------------------------
-- Storage: 차량 사진 / 브랜드 로고 버킷
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('vehicle-photos', 'vehicle-photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('branding', 'branding', true, 2097152, array['image/png', 'image/svg+xml', 'image/webp', 'image/jpeg'])
on conflict (id) do nothing;

create policy "storage: 관리자 업로드" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('vehicle-photos', 'branding') and public.is_admin());
create policy "storage: 관리자 수정" on storage.objects
  for update to authenticated
  using (bucket_id in ('vehicle-photos', 'branding') and public.is_admin());
create policy "storage: 관리자 삭제" on storage.objects
  for delete to authenticated
  using (bucket_id in ('vehicle-photos', 'branding') and public.is_admin());
create policy "storage: 관리자 조회" on storage.objects
  for select to authenticated
  using (bucket_id in ('vehicle-photos', 'branding') and public.is_admin());

-- ===== 20261019000002_initial_data.sql =====
-- BS CARS — 초기 운영 데이터
-- 사용자가 제공한 차량 3종과 가격(IVA 별도 기준가, IVA 10%)을 그대로 등록한다.
-- 원어(original_term)는 사용자가 제공한 용어만 기록한다.
-- 연식이 제공되지 않은 차량은 model_year를 비워 둔다(화면에는 "정보 확인 중").

insert into public.settings (id) values (1) on conflict (id) do nothing;

insert into public.vehicles
  (slug, name, model_year, mileage_km, base_price, iva_applies, iva_rate, billing_unit, status, is_published, sort_order)
values
  ('tivoli-2023', 'Tivoli',     2023, 25000,  800.00, true, 10, 'month', 'available', true, 10),
  ('kia-seltos',  'Kia Seltos', null,     0,  900.00, true, 10, 'month', 'available', true, 20),
  ('tucson',      'Tucson',     null,     0, 1100.00, true, 10, 'month', 'available', true, 30)
on conflict (slug) do nothing;

insert into public.handover_items (category, label, original_term, sort_order) values
  ('documents', '녹색 카드',            'Cédula Verde', 10),
  ('documents', '운행 허가증',          null, 20),
  ('documents', '소유권 사본',          null, 30),
  ('documents', '통관 증명서',          null, 40),
  ('documents', 'Garden 사용 승인서',   null, 50),
  ('equipment', '경고 삼각대',          null, 10),
  ('equipment', '잭',                   null, 20),
  ('equipment', '공구 세트',            null, 30),
  ('equipment', '소화기',               null, 40),
  ('equipment', '휠 렌치',              null, 50),
  ('equipment', '스페어타이어',         null, 60),
  ('equipment', '바닥 매트',            null, 70),
  ('equipment', '차량 매뉴얼',          null, 80),
  ('equipment', '정비 기록부',          null, 90),
  ('keys',      '차량 열쇠 2세트',      null, 10);

-- ===== 20261019000003_vehicle_specs.sql =====
-- 차량 사양(제조사·세부 모델·사양 목록) 추가
-- 사양 값은 운영자가 제공한 자료(공개 사양 조사 결과)를 그대로 옮긴 것이며,
-- 실제 차량별 확인이 필요하다는 안내(spec_note)를 함께 저장한다.

alter table public.vehicles
  add column brand text check (brand is null or char_length(brand) <= 60),
  add column variant text check (variant is null or char_length(variant) <= 120),
  add column specs jsonb not null default '[]'::jsonb check (jsonb_typeof(specs) = 'array' and jsonb_array_length(specs) <= 40),
  add column spec_note text check (spec_note is null or char_length(spec_note) <= 600);

update public.vehicles set
  brand = 'SsangYong',
  variant = 'Edición Limitada',
  specs = '[
    {"label":"차체","value":"컴팩트 SUV · 5도어"},
    {"label":"엔진","value":"1.5 터보 가솔린 · 4기통"},
    {"label":"배기량","value":"1,497 cc"},
    {"label":"출력","value":"163 CV"},
    {"label":"토크","value":"260 Nm (자동변속기 기준)"},
    {"label":"변속기","value":"자동 6단"},
    {"label":"구동 방식","value":"전륜 4×2"},
    {"label":"연료","value":"가솔린 (96 옥탄)"},
    {"label":"승차 정원","value":"5인"},
    {"label":"전장","value":"4,225 mm"}
  ]'::jsonb,
  spec_note = 'SsangYong Tivoli Edición Limitada 2022 공개 사양(1.5 터보 자동변속기 버전) 기준 참고 정보입니다. 실제 차량 사양은 인수 전 확인이 필요합니다.'
where slug = 'tivoli-2023';

update public.vehicles set
  brand = 'Kia',
  model_year = 2027,
  variant = '1.5 CRDi 디젤',
  specs = '[
    {"label":"엔진","value":"1.5 CRDi 터보 디젤 · 4기통"},
    {"label":"배기량","value":"1,493 cc"},
    {"label":"출력","value":"113 HP (파라과이 공개 기준) · 국제 기준 116 CV"},
    {"label":"토크","value":"250 Nm"},
    {"label":"변속기","value":"자동 6단 또는 수동 6단 (버전별)"},
    {"label":"구동 방식","value":"전륜 4×2"},
    {"label":"연료","value":"디젤"}
  ]'::jsonb,
  spec_note = 'All-New Kia Seltos 2027 디젤(파라과이 2026년 9월 출시) 공개 자료 기준 참고 정보입니다. 파라과이 판매 차량의 정확한 출력과 변속기는 확인이 필요합니다.'
where slug = 'kia-seltos';

update public.vehicles set
  brand = 'Hyundai',
  model_year = 2026,
  variant = '1.6 Turbo HEV 하이브리드',
  specs = '[
    {"label":"엔진","value":"1.6 터보 가솔린 + 전기 모터 (일반 하이브리드, 비플러그인)"},
    {"label":"출력","value":"226 HP 시스템 합산 (파라과이 판매 사양)"},
    {"label":"토크","value":"366 Nm"},
    {"label":"변속기","value":"자동 8단"},
    {"label":"구동 방식","value":"4×2 또는 AWD (버전별)"},
    {"label":"연료","value":"가솔린 하이브리드 · 연료탱크 52 L"},
    {"label":"승차 정원","value":"5인"},
    {"label":"전장","value":"4,630 mm"},
    {"label":"전폭","value":"1,865 mm"},
    {"label":"전고","value":"1,665 mm"},
    {"label":"축간거리","value":"약 2,755 mm"}
  ]'::jsonb,
  spec_note = 'Hyundai Tucson Hybrid 2026 파라과이 판매 사양 공개 자료 기준 참고 정보입니다. 구동 방식 등 차량별 사양은 확인이 필요합니다.'
where slug = 'tucson';

-- ===== 20261019000004_photo_reference.sql =====
-- 사진별 "참고 이미지" 표시: 실제 렌탈 차량이 아닌 동일 모델 사진인 경우 true
alter table public.vehicle_photos
  add column is_reference boolean not null default false;

-- Kia Seltos 사진은 운영자 확인 결과 동일 모델 참고 이미지
update public.vehicle_photos p
   set is_reference = true
  from public.vehicles v
 where v.id = p.vehicle_id and v.slug = 'kia-seltos';

-- ===== 20261019000005_whatsapp_number.sql =====
-- 운영자가 제공한 BS CARS WhatsApp 번호 (+595 983 465305)
-- 관리자 화면에서 이미 다른 번호를 등록했다면 덮어쓰지 않는다.
update public.settings
   set whatsapp_number = '595983465305'
 where id = 1 and whatsapp_number is null;
