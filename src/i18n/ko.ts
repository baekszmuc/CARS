/**
 * 고객용·관리자용 한국어 문구.
 * 다국어 확장 시 같은 구조의 es.ts 를 추가하고 src/i18n/index.ts 에서 locale 을 선택한다.
 * (현재는 한국어만 제공하며, 언어 전환 UI는 표시하지 않는다.)
 */
export const ko = {
  billingUnit: { day: "일", week: "주", month: "월", year: "연" },
  billingUnitPer: { day: "/ 일", week: "/ 주", month: "/ 월", year: "/ 연" },
  vehicleStatus: {
    available: "이용 가능",
    reserved: "예약 협의 중",
    rented: "렌트 중",
    maintenance: "정비 중",
    unavailable: "이용 불가",
  },
  inquiryStatus: {
    new: "신규",
    reviewing: "확인 중",
    contacted: "고객 연락 완료",
    contracting: "계약 진행 중",
    closed: "종료",
  },
  insuranceStatus: {
    not_set: "보험 정보 확인 중",
    proposal: "보험 제안서 검토 단계",
    active: "보험 가입 완료",
  },
  handoverCategory: {
    documents: "차량 서류",
    equipment: "차량 비품",
    keys: "열쇠",
  },
  handoverCheckStatus: {
    unchecked: "미확인",
    provided: "제공 확인",
    not_provided: "제공 안 됨",
  },
  common: {
    pending: "정보 확인 중",
    base: "기본 렌트료",
    iva: "IVA",
    withIva: "IVA 포함",
    ivaNotApplied: "IVA 미적용",
    year: "연식",
    mileage: "주행거리",
    details: "차량 상세 보기",
    inquire: "문의하기",
    whatsapp: "WhatsApp 문의",
    copyLink: "링크 복사",
    copied: "복사되었습니다",
    share: "공유하기",
    shareWhatsapp: "WhatsApp으로 공유",
    photoPending: "실제 차량 사진 준비 중",
  },
  nav: {
    home: "홈",
    vehicles: "차량",
    services: "포함 서비스",
    includes: "렌트 시 제공 품목",
    contact: "문의",
  },
  hero: {
    title: "당신의 이동을 위한 합리적인 선택.",
    subtitle: "차량 선택부터 정기 정비와 보험까지. 필요한 이동을 보다 편리하게 관리하세요.",
    compare: "차량 비교하기",
    terms: "렌탈 조건 확인하기",
    contact: "상담 문의하기",
  },
  whatsappMissing: "WhatsApp 상담 번호를 준비 중입니다. 아래 문의 양식을 이용해 주세요.",
  availabilityNotice:
    "문의를 제출해도 차량 예약이 확정되지 않습니다. 날짜별 이용 가능 여부는 담당자가 별도로 확인한 뒤 안내드립니다.",
} as const;

export type Dictionary = typeof ko;
