export const MAP_WIDTH = 1263;
export const MAP_HEIGHT = 669;

export const CAMPUS = {
  name: "가톨릭대학교 성심교정",
  shortName: "가톨릭대 성심교정",
};

// windSpeedMS: 기획안 등가 풍속 (최대 에너지 밀도에서 역산)
// vent: 현장 실측 전 시뮬레이션 가정값
export const BUILDINGS = [
  {
    id: "DASOL",
    name: "다솔관",
    windSpeedMS: 3.03,
    vent: {
      location: "중정 앞 옥상",
      distanceM: 0.6,
      areaM2: 0.25,
      heightM: 1.5,
      angleDegrees: 40,
    },
    label: [378, 263],
    outline:
      "M22 54L41 42.5H48V37.5L65 36L70.5 40L126.5 32V26L162.5 22L175 32H184.5L233 62V76L252.5 88.5V127L243 137.5L110 162.5L74.5 154L22 115.5V54Z",
    offset: [257.25, 148.75],
  },
  {
    id: "STUDENT-HALL",
    name: "학생회관",
    windSpeedMS: 2.44,
    vent: {
      location: "본관 후면 옥상",
      distanceM: 1.2,
      areaM2: 0.4,
      heightM: 2.2,
      angleDegrees: 50,
    },
    label: [670, 252],
    outline:
      "M22 38L134 22L151 32L233 46.5L282 39.5V34L295 32L300.5 34V41.5L317.5 49V64.5L324.5 68V82.5L311.5 86L300.5 82.5V91L255.5 97L249 95L233 99.5L212.5 101L201 95L175 93.5L149.5 89L134 91L126.5 89L79 95L63 85.5H53L31 89L29.5 85.5V80L22 75.5V38Z",
    offset: [517.75, 192.5],
  },
  {
    id: "NICHOLLS",
    name: "니콜스관",
    windSpeedMS: 3.14,
    vent: {
      location: "중앙동 옥상 복도측",
      distanceM: 1,
      areaM2: 0.36,
      heightM: 2,
      angleDegrees: 35,
    },
    label: [524, 351],
    outline:
      "M31.5 96H22V49L89 37.5L129.5 66V74.5L159.5 70L152.5 66V52.5L164.5 49V27L198.5 22L256.5 57L289.5 52.5L318.5 72V93.5L292 77.5L261 81V111L102 139.5L79 128.5L31.5 96Z",
    offset: [381.5, 255],
  },
  {
    id: "MARIA",
    name: "마리아관",
    windSpeedMS: 3,
    vent: {
      location: "연결동 인접 옥상",
      distanceM: 0.7,
      areaM2: 0.28,
      heightM: 1.6,
      angleDegrees: 30,
    },
    label: [719, 393],
    outline:
      "M59.0001 127V109.5L22.0001 78.5L94.0001 64.5L75.5001 53V26L106.5 22L150.5 49V42H164.5L172 46.5V53L231 89L254.5 86.5L285 106.5V149L277.5 154.5L213 163L137.5 112.5H132L59.0001 127Z",
    offset: [567, 312],
  },
  {
    id: "KIM-SOU-HWAN",
    name: "김수환관",
    windSpeedMS: 2.8,
    vent: {
      location: "고층동 상부 옥상 동측",
      distanceM: 0.8,
      areaM2: 0.3,
      heightM: 1.8,
      angleDegrees: 45,
    },
    label: [438, 476],
    outline:
      "M22 168.5V110.5L38 107L39 84.5L69 79.5L73.5 83L118 75.5V56L129 53V31L184 22L204.5 37.5V44H216.5L255.5 70.5V87.5L262.5 91.5V172H268.5L288.5 185.5V230.5L75.5 273L57 254V210L67.5 207.5L22 168.5Z",
    offset: [230.25, 328],
  },
];
