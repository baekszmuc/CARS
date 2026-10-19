/**
 * 렌트료에 포함된 서비스 — 사용자가 제공한 범위 그대로 기재한다.
 * 세부 정비 주기표(계약서 부속서 C)는 원문이 제공되지 않아 작성하지 않았다.
 */
export const servicesIntro =
  "아래 서비스는 렌트료에 포함됩니다. 실제 적용 범위와 조건은 렌탈 계약서와 부속 문서를 기준으로 합니다.";

export const maintenance = {
  title: "예방 정비",
  summary: "5,000 km부터 50,000 km까지 주행거리별 예방 정비를 제공합니다.",
  items: ["엔진오일", "오일필터", "에어필터", "연료필터", "기타 해당 정비 주기에 필요한 소모품", "정비 공임"],
  note: "정비 일정과 상세 항목은 계약서의 부속서 C(Anexo C)를 기준으로 합니다.",
};

export const majorParts = {
  title: "주요 부품 교체",
  summary: "정비 계획에 따라 다음 부품을 교체합니다.",
  items: [
    { km: "30,000 km", text: "브레이크 패드 및 디스크 연마" },
    { km: "35,000 km", text: "서스펜션 부품" },
    { km: "40,000 km", text: "구동벨트, 와이퍼 및 전구류 등" },
  ],
  note: "실제 교체 범위와 조건은 계약서 및 정비 계획에 따릅니다.",
};

export const tiresBattery = {
  title: "타이어 및 배터리",
  items: ["타이어 4개 교체", "배터리 교체", "교체 주기: 20,000 km마다"],
  note: "적용 조건은 렌탈 계약서에 따릅니다.",
};

export const insurance = {
  title: "전 위험 보험",
  coverage: ["화재", "사고", "도로상 차량 도난", "대인 배상", "대물 배상", "탑승자 상해"],
  note: "보험 보장 범위와 면책 조건은 실제 보험 약관 및 보험사 제안서를 기준으로 합니다.",
};

export const municipal = {
  title: "시청 운행 허가",
  text: "시청 운행 허가증(Habilitación Municipal)을 유지합니다.",
};

export const support = {
  title: "전화 기술 지원",
  text: "평일 및 토요일 업무시간에 전화 기술 지원을 제공합니다.",
};

export const serviceSummary = [
  { title: "예방 정비", text: "5,000–50,000 km 주행거리별 예방 정비" },
  { title: "주요 부품 교체", text: "브레이크·서스펜션·구동벨트 등 정비 계획에 따른 교체" },
  { title: "타이어 및 배터리", text: "20,000 km마다 타이어 4개 및 배터리 교체" },
  { title: "전 위험 보험", text: "화재·사고·도난·대인·대물·탑승자 상해" },
  { title: "시청 운행 허가 유지", text: "Habilitación Municipal 유지" },
  { title: "전화 기술 지원", text: "평일 및 토요일 업무시간" },
];
