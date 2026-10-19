import { optionInquiryLink, buildVehicleInquiryMessage } from "@/lib/whatsapp";
import type { Settings, Vehicle } from "@/lib/types";

function Icon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  );
}

/** 이 차량 정보가 담긴 WhatsApp 메시지를 바로 여는 버튼 */
export function OptionInquiryButton({
  vehicle,
  settings,
  url,
  className = "btn btn-primary",
  label = "이 옵션 문의하기",
}: {
  vehicle: Vehicle;
  settings: Settings;
  url: string;
  className?: string;
  label?: string;
}) {
  const href = optionInquiryLink(settings.whatsapp_number, buildVehicleInquiryMessage(vehicle, settings, url));
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} data-testid="option-inquiry">
      <Icon />
      {label}
    </a>
  );
}
