-- 운영자가 2026-11-24 에 알려준 새 문의 번호 (+595 983 826292). 이전 번호(+595 983 465305)일 때만 바꾼다.
update public.settings
   set whatsapp_number = '595983826292'
 where id = 1 and (whatsapp_number is null or whatsapp_number = '595983465305');
