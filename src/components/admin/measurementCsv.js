import { toSeoulIso } from "./shared";

const STATES = {
  ON: "ON",
  OFF: "OFF",
  UNKNOWN: "UNKNOWN",
  가동: "ON",
  정지: "OFF",
  "확인 전": "UNKNOWN",
};
const FLAGS = {
  VALID: "VALID",
  SUSPECT: "SUSPECT",
  INVALID: "INVALID",
  정상: "VALID",
  의심: "SUSPECT",
  제외: "INVALID",
};

export function parseMeasurementCsv(text, fallback) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2)
    return {
      records: [],
      errors: ["머리줄과 기록이 한 줄 이상 있어야 합니다."],
    };
  const head = lines[0].split(",").map((cell) => cell.trim());
  const col = (...names) => head.findIndex((name) => names.includes(name));
  const at = {
    key: col("clientRecordId", "기록번호"),
    time: col("measuredAt", "측정시각"),
    speed: col("windSpeedMS", "풍속"),
    state: col("operatingState", "HVAC"),
    building: col("buildingId", "건물"),
    vent: col("ventId", "배기구"),
    sensor: col("sensorId", "장비"),
    quality: col("qualityFlag", "품질"),
  };
  if (at.key < 0 || at.time < 0 || at.speed < 0)
    return {
      records: [],
      errors: ["머리줄에 기록번호·측정시각·풍속 열이 필요합니다."],
    };
  const errors = [];
  const seen = new Set();
  const records = lines.slice(1).flatMap((line, index) => {
    const cells = line.split(",").map((cell) => cell.trim());
    const row = index + 2;
    const key = cells[at.key];
    const speed = Number(cells[at.speed]);
    const time = (cells[at.time] || "").replace(" ", "T");
    const state = STATES[(at.state >= 0 && cells[at.state]) || "UNKNOWN"];
    const flag = FLAGS[(at.quality >= 0 && cells[at.quality]) || "VALID"];
    if (!key) errors.push(`${row}번째 줄: 기록번호가 비어 있습니다.`);
    else if (seen.has(key))
      errors.push(`${row}번째 줄: 기록번호 ${key}가 파일 안에서 중복됩니다.`);
    else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(time))
      errors.push(
        `${row}번째 줄: 측정시각 형식이 다릅니다 (예: 2026-11-18 15:00).`,
      );
    else if (
      cells[at.speed] === "" ||
      !Number.isFinite(speed) ||
      speed < 0 ||
      speed > 60
    )
      errors.push(`${row}번째 줄: 풍속은 0~60 m/s 숫자여야 합니다.`);
    else if (!state)
      errors.push(
        `${row}번째 줄: HVAC는 가동/정지/확인 전 중 하나여야 합니다.`,
      );
    else if (!flag)
      errors.push(`${row}번째 줄: 품질은 정상/의심/제외 중 하나여야 합니다.`);
    else {
      seen.add(key);
      return [
        {
          clientRecordId: key,
          measurement: {
            buildingId:
              (at.building >= 0 && cells[at.building]) || fallback.buildingId,
            ventId: (at.vent >= 0 && cells[at.vent]) || fallback.ventId,
            sensorId: (at.sensor >= 0 && cells[at.sensor]) || fallback.sensorId,
            measuredAt: toSeoulIso(time),
            timezone: "Asia/Seoul",
            windSpeedMS: speed,
            ventAreaM2: fallback.ventAreaM2,
            qualityFlag: flag,
            operatingState: state,
          },
        },
      ];
    }
    return [];
  });
  return { records, errors };
}
