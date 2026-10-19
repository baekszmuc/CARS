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
