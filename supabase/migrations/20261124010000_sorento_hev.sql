-- 네 번째 차량: Kia Sorento HEV (운영자 제공 2026-11-24)
-- 운영자 제공 정보만 등록한다: "SUV grande híbrido de tres filas, con tracción inteligente y una combinación de lujo y eficiencia."
-- 버전: SORENTO HEV — EX AT 2WD SEMI FULL | Híbrido. 월 렌트료 USD 1,350 (다른 차량과 같이 IVA 별도 기준가, IVA 10%).
-- 판매 현금가(USD 39,990)는 렌탈 화면에 표시하지 않는다. 연식·주행거리·출력 등은 제공되지 않아 비워 둔다.
insert into public.vehicles
  (slug, name, brand, model_year, mileage_km, base_price, iva_applies, iva_rate, billing_unit, status, is_published, sort_order,
   variant, description, specs, spec_note)
values
  ('kia-sorento-hev', 'Kia Sorento HEV', 'Kia', null, null, 1350.00, true, 10, 'month', 'available', true, 40,
   'EX AT 2WD Semi Full 하이브리드',
   '3열 대형 하이브리드 SUV. 지능형 구동 시스템과 고급스러움, 효율을 함께 갖췄습니다.',
   '[
     {"label":"차체","value":"대형 SUV · 3열"},
     {"label":"파워트레인","value":"하이브리드 (HEV)"},
     {"label":"변속기","value":"자동 (AT)"},
     {"label":"구동 방식","value":"2WD"},
     {"label":"트림","value":"EX Semi Full"}
   ]'::jsonb,
   '운영자가 제공한 판매 버전 정보(SORENTO HEV EX AT 2WD SEMI FULL) 기준입니다. 연식·출력 등 세부 사양은 확인 중입니다.')
on conflict (slug) do nothing;
