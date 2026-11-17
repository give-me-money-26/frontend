import { CHECKS } from "./labels";

const SEOUL_DATE = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" });
const SEOUL_TIME = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export const errorText = (error) =>
  error instanceof Error ? error.message : "데이터를 불러오지 못했습니다.";

export const format = (value, digits = 2) =>
  value == null || Number.isNaN(value)
    ? "—"
    : value.toLocaleString("ko-KR", { maximumFractionDigits: digits });

export const latestDecision = (decisions, candidateId) =>
  decisions
    .filter((d) => d.candidateId === candidateId)
    .sort((a, b) =>
      (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
    )[0];

export const stageOf = (candidate, decisions) =>
  latestDecision(decisions, candidate.id)?.status ?? candidate.recommendation;

export const checksOf = (detail) =>
  CHECKS.map(({ server, name }) => ({
    name,
    done: Boolean(
      detail &&
      (server
        ? !detail.missingEvidence.includes(server)
        : detail.latestValidation?.passed),
    ),
  }));

export const nextAction = (stage, detail) => {
  if (stage === "HOLD") return "보류 사유 공유 · 재검토 조건 확인";
  const missing = detail?.missingEvidence ?? [];
  if (missing.includes("반복 측정 3회 이상"))
    return "반복 실측 등록 (HVAC 가동·정지 각각)";
  if (missing.includes("VALID 풍속 측정")) return "측정 기록 품질 판정";
  if (missing.includes("배기구 실측 좌표·치수"))
    return "배기구 실측 좌표·치수 조사";
  if (!detail?.latestValidation?.passed) return "예측-실측 검증 실행";
  return "설비 영향(압력손실·소음) 확인 후 설치 검토";
};

export const baseRequest = (buildingId, defaults) => ({
  buildingId,
  sourceMode: "TIME_SLOT",
  hour: 15,
  windSpeedMS: null,
  collectionAreaM2: defaults.collectionAreaM2,
  efficiencyPercent: defaults.efficiencyPercent,
  distanceM: defaults.distanceM,
  angleDegrees: defaults.angleDegrees,
  operatingHoursPerDay: defaults.operatingHoursPerDay,
  operatingDaysPerYear: defaults.operatingDaysPerYear,
  tariffKrwPerKwh: defaults.tariffKrwPerKwh,
  carbonFactorKgPerKwh: defaults.carbonFactorKgPerKwh,
  installationCostKrw: null,
});

export const todaySeoul = () => SEOUL_DATE.format(new Date());

export const seoulTime = (iso, withYear = false) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const part = Object.fromEntries(
    SEOUL_TIME.formatToParts(date).map(({ type, value }) => [type, value]),
  );
  const day = `${part.month}-${part.day} ${part.hour}:${part.minute}`;
  return withYear ? `${part.year}-${day}` : day;
};

export const seoulDate = (iso) => seoulTime(iso, true).slice(0, 10);

export const toSeoulIso = (local) => `${local.slice(0, 16)}:00+09:00`;
