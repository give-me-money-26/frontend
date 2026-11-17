import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminEndpoints";
import { isAbort } from "../../api/client";
import { PAYBACK_LIMIT_YEARS } from "../../data/turbine";
import { cx } from "./cx";
import { STAGES, label } from "./labels";
import {
  baseRequest,
  checksOf,
  errorText,
  format,
  latestDecision,
  nextAction,
  seoulDate,
  seoulTime,
  stageOf,
  todaySeoul,
  yearsText,
} from "./shared";
import {
  AreaChart,
  Badge,
  Big,
  ConfirmWrite,
  DatePicker,
  Dropdown,
  Empty,
  ErrorNote,
  SubTabs,
  Term,
} from "./ui";

const FIELDS = [
  ["collectionAreaM2", "회수 면적 m²", 0.1, 20, 0.1],
  ["efficiencyPercent", "변환계수 %", 1, 59.3, 1],
  ["distanceM", "배기구와 거리 m", 1, 8, 0.5],
  ["angleDegrees", "터빈 각도 °", -80, 80, 5],
];
const PLACEMENT_FIELDS = ["distanceM", "angleDegrees"];
const GOALS = [10, 20, 30];
const SECTIONS = [
  ["sec1", "① 왜 후보인가"],
  ["sec2", "② 해볼 가치가 있나"],
  ["sec3", "③ 얼마나 믿을 수 있나"],
  ["sec4", "④ 아직 모르는 것"],
  ["sec5", "⑤ 결정"],
];
const SNAPSHOT_KEYS =
  /measurementCount|averageWindSpeedMS|recommendation|missingEvidence|latestValidation=\{?status/;

const snapshotSummary = (snapshot) =>
  snapshot
    .replace(/[{}]/g, "")
    .split(", ")
    .filter((item) => SNAPSHOT_KEYS.test(item))
    .join(" · ") || snapshot;

function invalidField(input) {
  const field = FIELDS.find(([key, , min, max]) => {
    const value = input[key];
    return !Number.isFinite(value) || value < min || value > max;
  });
  if (!field) return "";
  const [, name, min, max] = field;
  return `${name}은(는) ${min}~${max} 사이로 입력해 주세요.`;
}
function CandidateReview({
  candidateId,
  data,
  onSelect,
  onGo,
  onChanged,
  toast,
}) {
  const candidate =
    data.candidates.find((c) => c.id === candidateId) ?? data.candidates[0];
  const buildingId = candidate?.buildingId ?? "";
  const summary = data.buildings.find((b) => b.id === buildingId);
  const [detail, setDetail] = useState();
  const [building, setBuilding] = useState();
  const [stats, setStats] = useState();
  const [validations, setValidations] = useState([]);
  const [decision, setDecision] = useState();
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [input, setInput] = useState(() =>
    candidate ? baseRequest(candidate.buildingId, data.defaults) : null,
  );
  const [baseline, setBaseline] = useState(null);
  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [calcError, setCalcError] = useState("");
  const [placement, setPlacement] = useState(null);
  const [goal, setGoal] = useState(20);
  const latest = latestDecision(data.decisions, candidate?.id ?? "");
  const stage = candidate ? stageOf(candidate, data.decisions) : "MEASURE";
  const [form, setForm] = useState({
    status: stage,
    reason: "",
    assignee: "시설팀",
    dueAt: "",
    actor: "",
  });
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (!candidate) return;
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      adminApi.candidate(candidate.id, signal),
      adminApi.building(candidate.buildingId, signal),
      adminApi.measurementSummary(
        { buildingId: candidate.buildingId, ventId: candidate.ventId },
        signal,
      ),
      adminApi.validations(candidate.buildingId, signal),
      latest
        ? adminApi.decision(latest.id, signal)
        : Promise.resolve(undefined),
    ])
      .then(([d, b, s, v, dec]) => {
        setLoadError("");
        setForm({
          status: dec?.status ?? d.recommendation,
          reason: "",
          assignee: dec?.assignee ?? "시설팀",
          dueAt: dec?.dueAt ? seoulDate(dec.dueAt) : "",
          actor: "",
        });
        setDetail(d);
        setBuilding(b);
        setStats(s);
        setValidations(v);
        setDecision(dec);
      })
      .catch((e) => !isAbort(e) && setLoadError(errorText(e)));
    return () => controller.abort();
  }, [candidate, latest, retry]);
  useEffect(() => {
    if (!input) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setCalcError("");
      const job = baseline
        ? adminApi.compare(baseline, input, controller.signal).then((c) => {
            setComparison(c);
            setResult(c.current);
          })
        : adminApi.simulate(input, controller.signal).then((r) => {
            setComparison(null);
            setResult(r);
          });
      job.catch((e) => !isAbort(e) && setCalcError(errorText(e)));
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [input, baseline]);
  const hours = building?.hourlySeries ?? [];
  const peak = hours.reduce(
    (a, h) => (h.densityWM2 > (a?.densityWM2 ?? -1) ? h : a),
    hours[0],
  );
  const checks = checksOf(detail);
  const scenarios = result?.turbineScenarios ?? [];
  const first = scenarios[0];
  const firstYears = first?.paybackYears;
  const need = Number.isFinite(firstYears) ? firstYears / goal : Number.NaN;
  const validation =
    validations.find((v) => v.ventId === candidate?.ventId) ?? validations[0];
  const invalid = input ? invalidField(input) : "";

  if (!candidate) return <Empty title="후보가 없습니다" />;

  const setField = (key, value) =>
    setInput((prev) => ({
      ...prev,
      [key]: value === "" ? Number.NaN : Number(value),
    }));

  const findPlacement = () =>
    adminApi
      .placement({
        buildingId: candidate.buildingId,
        ventId: candidate.ventId,
        source: "TIME_SLOT",
        hour: input.hour ?? 15,
        collectionAreaM2: input.collectionAreaM2,
        efficiencyPercent: input.efficiencyPercent,
        distanceRangeM: { min: 1, max: 4, step: 1 },
        angleRangeDegrees: { min: -30, max: 30, step: 15 },
        limit: 3,
      })
      .then(setPlacement)
      .catch((e) => setCalcError(errorText(e)));

  const resetInput = () => {
    setInput(baseRequest(candidate.buildingId, data.defaults));
    setPlacement(null);
  };
  return (
    <>
      <SubTabs
        tabs={data.candidates.map((c) => [c.id, c.buildingName])}
        value={candidate.id}
        onChange={onSelect}
      />
      <ErrorNote error={loadError} onRetry={() => setRetry((v) => v + 1)} />

      <div className={cx("concl")}>
        <div className={cx("label")}>한 줄 결론</div>
        <p>
          {candidate.buildingName}은 <Term k="1차 실측" />
          에서 5곳 중 {summary?.priorityRank}위(최대 {summary?.peakDensityWM2}{" "}
          <Term k="W/m²" />
          )입니다.{" "}
          {Number.isFinite(firstYears) && (
            <>
              소형 터빈 한 대의 <Term k="회수기간" />은 약{" "}
              {firstYears >= PAYBACK_LIMIT_YEARS
                ? `${PAYBACK_LIMIT_YEARS}년 이상`
                : `${Math.round(firstYears)}년`}
              이라{" "}
            </>
          )}
          {stage === "HOLD" ? (
            "지금은 보류된 후보입니다."
          ) : (
            <>
              바로 설치하기보다 근거부터 채웁니다. 다음 할 일:{" "}
              <b>{nextAction(stage, detail)}</b>
            </>
          )}
        </p>
        <nav className={cx("toc")} aria-label="검토서 목차">
          {SECTIONS.map(([id, text]) => (
            <button
              type="button"
              key={id}
              onClick={() =>
                document
                  .getElementById(id)
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              {text}
            </button>
          ))}
        </nav>
      </div>

      <section className={cx("panel row between")}>
        <div>
          <div className={cx("label")}>후보</div>
          <b className={cx("h")}>{candidate.ventName}</b>{" "}
          <span className={cx("note")}>{summary?.priorityRank}순위</span>
        </div>
        <div className={cx("row")}>
          <Badge code={stage} />
          <span className={cx("note")}>
            근거 {checks.filter((c) => c.done).length}/{checks.length}
          </span>
        </div>
      </section>

      <section className={cx("panel")} id="sec1">
        <h3>① 왜 후보인가</h3>
        <div className={cx("grid g12")}>
          <div>
            <div className={cx("inner")}>
              <div className={cx("label")}>
                <Term k="1차 실측" /> 최대 밀도
              </div>
              <Big value={summary?.peakDensityWM2} unit="W/m²" />
              <div className={cx("note")}>
                {peak ? `${peak.hour}시` : ""} · 5개 건물 중{" "}
                {summary?.priorityRank}위
              </div>
            </div>
            <p className={cx("note")}>{building?.densityNotice}</p>
          </div>
          <div className={cx("inner")}>
            <div className={cx("label")}>
              시간대별 풍력 에너지 밀도 (1차 실측, 하루)
            </div>
            <AreaChart
              label="시간대별 풍력 에너지 밀도"
              points={hours.map((h) => ({ x: `${h.hour}시`, y: h.densityWM2 }))}
            />
          </div>
        </div>
      </section>

      <section className={cx("panel")} id="sec2">
        <h3>② 해볼 가치가 있나</h3>
        {input && (
          <div className={cx("row controls")}>
            <Dropdown
              label="시각"
              value={input.hour ?? 15}
              options={hours.map((h) => [h.hour, `${h.hour}시`])}
              onChange={(hour) => setInput({ ...input, hour })}
            />
            {FIELDS.map(([key, name, min, max, step]) => (
              <label className={cx("field")} key={key}>
                {PLACEMENT_FIELDS.includes(key) ? (
                  <span>
                    <Term k="배치계수">{name}</Term>
                  </span>
                ) : (
                  name
                )}
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={Number.isNaN(input[key]) ? "" : input[key]}
                  onChange={(e) => setField(key, e.target.value)}
                />
              </label>
            ))}
            <button
              type="button"
              className={cx("btn")}
              onClick={() => {
                setBaseline(input);
                toast("현재 조건을 기준안으로 저장했습니다");
              }}
              disabled={Boolean(invalid)}
            >
              기준안으로 저장
            </button>
            {baseline && (
              <button
                type="button"
                className={cx("btn")}
                onClick={() => setBaseline(null)}
              >
                기준안 해제
              </button>
            )}
            <button type="button" className={cx("btn")} onClick={resetInput}>
              기본값으로
            </button>
            <button
              type="button"
              className={cx("btn")}
              disabled={Boolean(invalid)}
              onClick={findPlacement}
            >
              배치 후보 보기
            </button>
          </div>
        )}
        <ErrorNote error={invalid || calcError} />
        <div className={cx("grid g4")}>
          <div className={cx("inner")}>
            <div className={cx("label")}>예상 회수 전력</div>
            <Big value={result?.recoveredPowerW} unit="W" digits={2} />
            {comparison && (
              <div className={cx("note accent3")}>
                기준안 대비 {comparison.recoveredPowerDeltaW >= 0 ? "+" : ""}
                {format(comparison.recoveredPowerDeltaW, 2)}W (
                {format(comparison.recoveredPowerDeltaPercent, 1)}%)
              </div>
            )}
          </div>
          <div className={cx("inner")}>
            <div className={cx("label")}>연간 발전량</div>
            <Big value={result?.annualEnergyKwh} unit="kWh" digits={2} />
            <div className={cx("note")}>
              하루 {data.defaults?.operatingHoursPerDay}시간·
              {data.defaults?.operatingDaysPerYear}일 가정
            </div>
          </div>
          <div className={cx("inner")}>
            <div className={cx("label")}>연간 절감액</div>
            <Big value={result?.annualSavingsKrw} unit="원" digits={0} />
          </div>
          <div className={cx("inner")}>
            <div className={cx("label")}>
              터빈 1 <Term k="회수기간" />
            </div>
            <div className={cx("big")}>
              {!Number.isFinite(firstYears)
                ? "—"
                : firstYears >= PAYBACK_LIMIT_YEARS
                  ? `${PAYBACK_LIMIT_YEARS}+`
                  : format(firstYears, 1)}
              <small>년</small>
            </div>
          </div>
        </div>
        {placement && (
          <div className={cx("inner spaced")}>
            <div className={cx("row between")}>
              <div className={cx("label")}>
                배치 후보 (설치 권고 아님 · 현장 검토 필요)
              </div>
              <button
                type="button"
                className={cx("btn sm")}
                onClick={() => setPlacement(null)}
              >
                닫기
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>거리</th>
                  <th>각도</th>
                  <th>예상 출력</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {placement.candidates.map((p) => (
                  <tr key={p.rank}>
                    <td>{p.rank}</td>
                    <td>{p.distanceM} m</td>
                    <td>{p.angleDegrees}°</td>
                    <td>{format(p.predictedPowerW, 2)} W</td>
                    <td>
                      <button
                        type="button"
                        className={cx("btn sm")}
                        onClick={() => {
                          setInput({
                            ...input,
                            distanceM: p.distanceM,
                            angleDegrees: p.angleDegrees,
                          });
                          setPlacement(null);
                        }}
                      >
                        이 조건 적용
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={cx("note")}>{placement.limitations.join(" · ")}</p>
          </div>
        )}
        <div className={cx("grid g2 spaced")}>
          <div className={cx("inner")}>
            <div className={cx("label")}>터빈별 단순 회수기간 (가정 제품)</div>
            <table>
              <thead>
                <tr>
                  <th>제품</th>
                  <th>제품가+설치비</th>
                  <th>연 절감</th>
                  <th>회수기간</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((t) => (
                  <tr key={t.turbineId}>
                    <td>{t.name}</td>
                    <td>{format(t.priceKrw + t.installCostKrw, 0)}원</td>
                    <td>{format(t.annualSavingsKrw, 0)}원</td>
                    <td>{yearsText(t.paybackYears)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={cx("inner")}>
            <div className={cx("row between")}>
              <div className={cx("label")}>
                목표 회수기간을 맞추려면 (터빈 1)
              </div>
              <div
                className={cx("seg")}
                role="group"
                aria-label="목표 회수기간"
              >
                {GOALS.map((y) => (
                  <button
                    type="button"
                    key={y}
                    className={cx(goal === y && "on")}
                    aria-pressed={goal === y}
                    onClick={() => setGoal(y)}
                  >
                    {y}년
                  </button>
                ))}
              </div>
            </div>
            {!Number.isFinite(need) ? (
              <p className={cx("note")}>계산 결과를 불러오는 중입니다.</p>
            ) : firstYears <= goal ? (
              <p>현재 조건으로 {goal}년 안에 회수됩니다.</p>
            ) : (
              <p className={cx("lh")}>
                회수 면적 약{" "}
                <b className={cx("num")}>
                  {format(
                    Math.ceil((input?.collectionAreaM2 ?? 0) * need * 10) / 10,
                    1,
                  )}
                </b>{" "}
                m² (현재의 {format(need, 1)}배) 또는
                <br />
                총비용 약 <b className={cx("num")}>{format(100 / need, 0)}</b>%
                수준 (
                {format((first.priceKrw + first.installCostKrw) / need, 0)}원)이
                필요합니다.
              </p>
            )}
            <p className={cx("note")}>
              설치 보장값이 아니라 1차 실측값과 가정으로 계산한 시나리오입니다.
            </p>
          </div>
        </div>
      </section>

      <section className={cx("panel")} id="sec3">
        <h3>③ 얼마나 믿을 수 있나</h3>
        {stats && stats.count > 0 ? (
          <div className={cx("grid g112")}>
            <div className={cx("inner")}>
              <div className={cx("label")}>정상 판정 반복 실측</div>
              <Big value={stats.count} unit="건" digits={0} />
              <div className={cx("note")}>
                평균 풍속 {format(stats.averageWindSpeedMS, 2)} m/s
              </div>
            </div>
            <div className={cx("inner")}>
              <div className={cx("label")}>
                <Term k="예측-실측 오차" />
              </div>
              {validation ? (
                <>
                  <Big
                    value={validation.metrics.maeW}
                    unit="W 평균 오차"
                    digits={2}
                  />
                  <div className={cx("note")}>
                    RMSE {format(validation.metrics.rmseW, 2)} · 표본{" "}
                    {validation.sampleCount}쌍
                  </div>
                  <Badge
                    code={validation.acceptance.passed ? "passed" : "failed"}
                  />
                </>
              ) : (
                <p className={cx("note")}>아직 없음 → 장치 실험 후 검증</p>
              )}
            </div>
            <div className={cx("inner")}>
              <div className={cx("label")}>
                반복 실측 시간대별 평균 밀도 (정상 기록)
              </div>
              <AreaChart
                label="반복 실측 시간대별 평균 밀도"
                height={140}
                points={stats.hourly.map((h) => ({
                  x: `${h.hour}시`,
                  y: h.averageDensityWM2,
                }))}
              />
            </div>
          </div>
        ) : (
          <Empty title="아직 정상 판정된 반복 실측 기록이 없습니다">
            지금 근거는 하루 측정한 1차 실측값뿐입니다. HVAC 가동·정지 상태를
            함께 기록하는 반복 실측이 필요합니다.
            <br />
            <button
              type="button"
              className={cx("btn pri")}
              onClick={() => onGo("field", candidate.buildingId)}
            >
              현장 실측으로
            </button>
          </Empty>
        )}
      </section>

      <section className={cx("panel")} id="sec4">
        <h3>④ 아직 모르는 것</h3>
        <ul className={cx("checks")}>
          {checks.map((c) => (
            <li key={c.name} className={cx(c.done ? "done" : "")}>
              <span aria-hidden>{c.done ? "✅" : "⬜"}</span>
              {c.name}
              <span className={cx("sr-only")}>
                {c.done ? " 확보" : " 미확보"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={cx("panel")} id="sec5">
        <h3>⑤ 결정</h3>
        <div className={cx("grid g2")}>
          <div className={cx("inner")}>
            <div className={cx("label")}>
              {latest ? "결정 바꾸기" : "결정 남기기"}
            </div>
            <div
              className={cx("seg decision-seg")}
              role="radiogroup"
              aria-label="단계"
            >
              {STAGES.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  role="radio"
                  aria-checked={form.status === s.id}
                  className={cx(form.status === s.id && "on")}
                  onClick={() => setForm({ ...form, status: s.id })}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <label className={cx("field")}>
              사유 (필수)
              <input
                value={form.reason}
                maxLength={200}
                placeholder="예: 반복 측정 3회 확보 후 설비 영향 확인 필요"
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </label>
            <div className={cx("row decision-meta")}>
              <label className={cx("field")}>
                담당
                <input
                  value={form.assignee}
                  maxLength={40}
                  onChange={(e) =>
                    setForm({ ...form, assignee: e.target.value })
                  }
                />
              </label>
              <DatePicker
                label="기한"
                min={todaySeoul()}
                value={form.dueAt}
                onChange={(dueAt) => setForm({ ...form, dueAt })}
              />
              {latest && (
                <label className={cx("field")}>
                  바꾸는 사람 (필수)
                  <input
                    value={form.actor}
                    maxLength={40}
                    onChange={(e) =>
                      setForm({ ...form, actor: e.target.value })
                    }
                  />
                </label>
              )}
            </div>
            <div className={cx("row end decision-actions")}>
              <button
                type="button"
                className={cx("btn pri")}
                disabled={
                  !form.reason.trim() ||
                  (latest
                    ? !form.actor.trim() || form.reason.trim() === latest.reason
                    : false)
                }
                onClick={() => setConfirm(true)}
              >
                {latest ? "결정 변경 저장" : "결정 저장"}
              </button>
            </div>
            <p className={cx("note")}>
              저장할 때 그 시점의 근거(측정 수·검증·부족한 근거)가 함께
              보관됩니다. "보류"도 기록으로 남습니다.
            </p>
          </div>
          <div className={cx("inner")}>
            <div className={cx("label")}>결정 이력</div>
            {decision ? (
              <>
                <p>
                  <Badge code={decision.status} /> {decision.reason}
                </p>
                <p className={cx("note")}>
                  담당 {decision.assignee ?? "—"} · 기한{" "}
                  {decision.dueAt ? seoulDate(decision.dueAt) : "—"}
                </p>
                {decision.evidenceSnapshot && (
                  <details className={cx("snapshot")}>
                    <summary>결정할 때 보관한 근거 보기</summary>
                    <p className={cx("note")}>
                      {snapshotSummary(decision.evidenceSnapshot)}
                    </p>
                  </details>
                )}
                <table>
                  <thead>
                    <tr>
                      <th>시각</th>
                      <th>변경</th>
                      <th>사유</th>
                      <th>바꾼 사람</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(decision.history ?? []).map((h, i) => (
                      <tr key={i}>
                        <td>{seoulTime(h.changedAt)}</td>
                        <td>
                          <Badge code={h.previousStatus} /> →{" "}
                          <Badge code={h.newStatus} />
                        </td>
                        <td>{h.reason}</td>
                        <td>{h.actor}</td>
                      </tr>
                    ))}
                    <tr>
                      <td>{seoulTime(decision.createdAt)}</td>
                      <td>
                        처음 결정 →{" "}
                        <Badge
                          code={
                            (decision.history ?? [])[0]?.previousStatus ??
                            decision.status
                          }
                        />
                      </td>
                      <td colSpan={2} className={cx("note")}>
                        처음 결정의 사유·사람은 근거 기록에 함께 보관됩니다
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            ) : (
              <p className={cx("note")}>아직 남긴 결정이 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      {confirm && (
        <ConfirmWrite
          title={latest ? "결정 변경" : "결정 저장"}
          rows={[
            ["후보", candidate.ventName],
            ["단계", label(form.status)],
            ["사유", form.reason],
            ["담당", form.assignee || "—"],
            ["기한", form.dueAt || "—"],
            ...(latest ? [["바꾸는 사람", form.actor]] : []),
          ]}
          onCancel={() => setConfirm(false)}
          onConfirm={async () => {
            const dueAt = form.dueAt
              ? `${form.dueAt}T18:00:00+09:00`
              : undefined;
            if (latest)
              await adminApi.updateDecision(latest.id, {
                status: form.status,
                reason: form.reason.trim(),
                assignee: form.assignee.trim() || undefined,
                dueAt,
                actor: form.actor.trim(),
              });
            else
              await adminApi.createDecision({
                candidateId: candidate.id,
                status: form.status,
                reason: form.reason.trim(),
                assignee: form.assignee.trim() || undefined,
                dueAt,
              });
            setConfirm(false);
            toast("결정과 그 시점의 근거를 저장했습니다");
            onChanged();
          }}
        />
      )}
    </>
  );
}

export default CandidateReview;
