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
