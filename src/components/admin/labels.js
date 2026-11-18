export const LABEL = {
  ROOF_EXHAUST: "옥상 배기구",
  UNKNOWN: "확인 전",
  ESTIMATED: "추정값",
  SURVEY: "현장 조사",
  DRAWING: "도면",
  PRELIMINARY_DATA: "1차 실측 자료",
  MEASURE: "측정 필요",
  REVIEW: "설치 검토",
  HOLD: "보류",
  VALID: "정상",
  SUSPECT: "의심",
  INVALID: "제외",
  DRAFT: "검증 전",
  VERIFIED: "검증됨",
  REJECTED: "반려",
  COMPLETED: "완료",
  passed: "통과",
  failed: "미통과",
  REQUIRES_SITE_REVIEW: "현장 검토 필요",
  ON: "가동",
  OFF: "정지",
  WIND_SPEED: "풍속",
  AIR_DENSITY: "공기 밀도",
  CARBON_FACTOR: "탄소 배출계수",
  TARIFF: "전기요금",
  KG_PER_M3: "kg/m³",
  KGCO2_PER_KWH: "kgCO₂/kWh",
  KRW_PER_KWH: "원/kWh",
  UNVERIFIED: "미확인",
  BUILDING_LOCAL_M: "건물 기준 좌표(m)",
};

export const label = (code) => (code ? (LABEL[code] ?? code) : "—");

export const STAGES = [
  { id: "MEASURE", name: "측정 필요" },
  { id: "REVIEW", name: "설치 검토" },
  { id: "HOLD", name: "보류" },
];

export const CHECKS = [
  { server: "배기구 실측 좌표·치수", name: "배기구 실측 좌표·치수" },
  { server: "반복 측정 3회 이상", name: "반복 측정 3회 이상" },
  { server: "VALID 풍속 측정", name: "정상 판정 풍속 기록" },
  {
    server: "HVAC 운전상태·압력손실·소음 검증",
    name: "HVAC 운전 상태·압력손실·소음 확인",
  },
  { server: "", name: "예측-실측 검증 통과" },
];

export const TERMS = {
  "1차 실측":
    "팀이 하루(10~22시) 풍속계로 5개 건물 배기구 앞을 잰 값. 건물·시간대 비교에는 쓰지만 장비·위치·설비 상태 기록이 없어 발전량 검증에는 못 씁니다.",
  "반복 실측":
    "같은 배기구를 여러 날, 설비 가동·정지를 나눠 다시 재는 것. 시각·배기구·장비·HVAC 상태가 한 건마다 붙어 검증에 쓸 수 있습니다.",
  "W/m²":
    "풍력 에너지 밀도. 바람이 1㎡ 면적에 가진 에너지 크기로, 실제 발전량(W)이 아닙니다.",
  후보: "실험할지 검토 중인 배기구 하나. 지금은 5개 건물에 1곳씩입니다.",
  근거: "설치를 판단하는 데 필요한 확인 항목 5가지(배기구 좌표, 반복 측정, 정상 기록, 설비 영향, 예측 검증) 중 확보한 수.",
  회수기간:
    "터빈 가격+설치비를 1년 전기요금 절감액으로 나눈 값. 유지보수비는 빠진 단순 계산입니다.",
  배치계수:
    "터빈이 배기구에서 멀어지거나 비스듬할수록 줄어드는 비율을 나타낸 설명용 근사식(정밀 해석 아님).",
  "예측-실측 오차":
    "계산으로 예상한 전력과 장치를 달아 실제 잰 전력의 차이. 작을수록 계산을 믿을 수 있습니다.",
  "측정 필요": "근거가 부족해 반복 실측부터 해야 하는 단계.",
  "설치 검토": "근거가 모여 설비 영향·비용을 따져 볼 단계.",
  보류: "지금은 설치 가치가 낮아 멈춘 단계. 이것도 기록으로 남깁니다.",
};

export const INFO = {
  home: {
    ko: "판단 현황",
    desc: "후보 한눈에 보기",
    todo: "후보 배기구 5곳이 어느 단계에 있는지 보고, 가장 먼저 할 일을 고릅니다.",
  },
  review: {
    ko: "후보 검토서",
    desc: "근거 읽고 결정",
    todo: "한 후보의 근거를 위에서부터 읽고, 맨 아래에서 결정을 남깁니다.",
  },
  field: {
    ko: "현장 실측",
    desc: "측정값 기록",
    todo: "측정 요청이 온 후보에 현장에서 잰 값을 기록하고, 이상한 기록은 품질 판정합니다.",
  },
  records: {
    ko: "검증·기록",
    desc: "예측·검증·결정 기록",
    todo: "쌓인 실측으로 발전량을 예측하고, 예측이 맞았는지 오차를 남깁니다. 결정 기록도 여기 모입니다.",
  },
  evidence: {
    ko: "비용·탄소 근거",
    desc: "회수기간·탄소 출처",
    todo: "회수기간·탄소 저감 숫자와 그 숫자가 나온 가정·출처를 확인합니다.",
  },
};

export const NAV = [
  ["결정하기", ["home", "review"]],
  ["근거 채우기", ["field", "records"]],
  ["설명 자료", ["evidence"]],
];
