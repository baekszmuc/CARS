-- 운영자가 제공한 BS CARS WhatsApp 번호 (+595 983 465305)
-- 관리자 화면에서 이미 다른 번호를 등록했다면 덮어쓰지 않는다.
update public.settings
   set whatsapp_number = '595983465305'
 where id = 1 and whatsapp_number is null;
