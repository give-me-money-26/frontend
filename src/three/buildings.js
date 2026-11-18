import { buildDasolHall } from "./models/dasolhall.js";
import { buildKimSuHwan } from "./models/kimsuhwan.js";
import { buildMariaHall } from "./models/mariahall.js";
import { buildNicholsHall } from "./models/nicholshall.js";
import { buildStudentHall } from "./models/studenthall.js";

export const BUILDING_MODELS = {
  NICHOLLS: buildNicholsHall,
  "KIM-SOU-HWAN": buildKimSuHwan,
  DASOL: buildDasolHall,
  MARIA: buildMariaHall,
  "STUDENT-HALL": buildStudentHall,
};

export const DEFAULT_BUILDING_ID = "NICHOLLS";

export const BUILDING_FIT_SIZE = 34;
