import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminEndpoints";
import { isAbort } from "../../api/client";
import { cx } from "./cx";
import { STAGES } from "./labels";
import {
  checksOf,
  errorText,
  latestDecision,
  nextAction,
  seoulTime,
  stageOf,
} from "./shared";
import { Bar, Big, ErrorNote, Term } from "./ui";

function DecisionBoard({ data, onOpen }) {
  const { buildings, candidates, decisions } = data;
  const [details, setDetails] = useState({});
  const [missing, setMissing] = useState({});
  const [counts, setCounts] = useState({ measurements: 0, validations: 0 });
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      Promise.all(candidates.map((c) => adminApi.candidate(c.id, signal))),
      Promise.all(buildings.map((b) => adminApi.dashboard(b.id, signal))),
      adminApi.validations(undefined, signal),
      adminApi.measurements({ page: 0, size: 1 }, signal),
    ])
      .then(([candidateDetails, dashboards, validations, page]) => {
        setError("");
        setDetails(Object.fromEntries(candidateDetails.map((c) => [c.id, c])));
        setMissing(
          Object.fromEntries(
            dashboards.map((d) => [d.building.id, d.missingEvidence.length]),
          ),
        );
        setCounts({
          measurements: page.totalElements,
          validations: validations.length,
        });
      })
      .catch((e) => !isAbort(e) && setError(errorText(e)));
    return () => controller.abort();
  }, [candidates, buildings, retry]);

  const stages = candidates.map((c) => ({
    ...c,
    stage: stageOf(c, decisions),
  }));
  const first = stages.find((c) => c.stage !== "HOLD");
  const buildingOf = (id) => buildings.find((b) => b.id === id);

  const owner = (candidateId) => {
    const decision = latestDecision(decisions, candidateId);
    if (!decision) return null;
    const due = decision.dueAt
      ? `${seoulTime(decision.dueAt).slice(0, 5)}까지`
      : "기한 없음";
    return `${decision.assignee ?? "담당 미정"} · ${due}`;
  };

  return (
    <>
      <ErrorNote error={error} onRetry={() => setRetry((v) => v + 1)} />
      {first && (
        <div className={cx("firstcard")}>
          <div>
            <div className={cx("label")}>지금 가장 먼저 할 일</div>
            <b>
              {first.buildingName} ·{" "}
              {nextAction(first.stage, details[first.id])}
            </b>
            <div className={cx("note")}>
              <Term k="1차 실측" /> 순위가 가장 높은 후보부터 근거를 채웁니다.
            </div>
          </div>
          <button
            type="button"
            className={cx("btn pri")}
            onClick={() => onOpen(first.id)}
          >
            검토서 열기 →
          </button>
        </div>
      )}
      <div className={cx("grid g4 summary")}>
        <div className={cx("panel flat")}>
          <div className={cx("label")}>
            검토 중인 <Term k="후보" />
          </div>
          <Big value={candidates.length} unit="개 배기구" digits={0} />
        </div>
        <div className={cx("panel flat")}>
          <div className={cx("label")}>
            <Term k="반복 실측" /> 기록
          </div>
          <Big value={counts.measurements} unit="건" digits={0} />
        </div>
        <div className={cx("panel flat")}>
          <div className={cx("label")}>예측-실측 검증</div>
          <Big value={counts.validations} unit="건" digits={0} />
        </div>
        <div className={cx("panel flat")}>
          <div className={cx("label")}>남긴 결정</div>
          <Big value={decisions.length} unit="건" digits={0} />
        </div>
      </div>
      <section className={cx("panel")}>
        <h3>후보별 단계</h3>
        <div className={cx("kan")}>
          {STAGES.map(({ id, name }) => {
            const list = stages.filter((c) => c.stage === id);
            return (
              <div className={cx("kcol")} key={id}>
                <b>
                  <Term k={name} />
                </b>
                {list.map((c) => {
                  const building = buildingOf(c.buildingId);
                  const checks = checksOf(details[c.id]);
                  const done = checks.filter((check) => check.done).length;
                  return (
                    <button
                      type="button"
                      className={cx("kcard")}
                      key={c.id}
                      onClick={() => onOpen(c.id)}
                    >
                      <span className={cx("row between")}>
                        <b>{c.buildingName}</b>
                        <span className={cx("note")}>
                          {building?.priorityRank}순위 · 최대{" "}
                          {building?.peakDensityWM2} W/m²
                        </span>
                      </span>
                      <span className={cx("note")}>
                        <Term k="근거" /> {done} / {checks.length} 확보
                      </span>
                      <Bar value={done} total={checks.length} />
                      <span>
                        다음: <b>{nextAction(id, details[c.id])}</b>
                      </span>
                      <span className={cx("note")}>
                        {owner(c.id) ??
                          `현장 기록 누락: ${missing[c.buildingId] ?? "—"}가지`}
                      </span>
                    </button>
                  );
                })}
                {!list.length && <p className={cx("note")}>해당 후보 없음</p>}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

export default DecisionBoard;
