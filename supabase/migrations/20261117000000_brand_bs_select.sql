-- 상호 변경: BS CARS → BS Select
alter table public.settings alter column business_name set default 'BS Select';
update public.settings set business_name = 'BS Select' where business_name = 'BS CARS';
