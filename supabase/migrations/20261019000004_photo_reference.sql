-- 사진별 "참고 이미지" 표시: 실제 렌탈 차량이 아닌 동일 모델 사진인 경우 true
alter table public.vehicle_photos
  add column is_reference boolean not null default false;

-- Kia Seltos 사진은 운영자 확인 결과 동일 모델 참고 이미지
update public.vehicle_photos p
   set is_reference = true
  from public.vehicles v
 where v.id = p.vehicle_id and v.slug = 'kia-seltos';
