import { buildDasolHall } from "./models/dasolhall.js";
import { buildKimSuHwan } from "./models/kimsuhwan.js";
import { buildMariaHall } from "./models/mariahall.js";
import { buildNicholsHall } from "./models/nicholshall.js";
import { buildStudentHall } from "./models/studenthall.js";

// 키는 API 명세의 건물 id (NICHOLLS는 L 두 개)
export const BUILDING_MODELS = {
  NICHOLLS: buildNicholsHall,
  "KIM-SOU-HWAN": buildKimSuHwan,
  DASOL: buildDasolHall,
  MARIA: buildMariaHall,
  "STUDENT-HALL": buildStudentHall,
};

export const DEFAULT_BUILDING_ID = "NICHOLLS";

// 건물마다 실제 크기가 달라서 가장 긴 가로 변을 이 길이로 맞춤
export const BUILDING_FIT_SIZE = 34;
