import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminEndpoints";
import { isAbort } from "../../api/client";
import { cx } from "./cx";
import { label } from "./labels";
import { baseRequest, errorText, format, yearsText } from "./shared";
import { AreaChart, Badge, ErrorNote, SubTabs, Term } from "./ui";

const TABS = [
  ["money", "재무: 회수기간"],
  ["carbon", "환경: 탄소·계수"],
  ["turbine", "터빈 제품"],
];

const paybackOf = (result) => result.turbineScenarios?.[0]?.paybackYears;
function Evidence({ data, tab, onTab, onReview }) {
  const [results, setResults] = useState([]);
  const [factors, setFactors] = useState([]);
  const [turbines, setTurbines] = useState([]);
  const [turbine, setTurbine] = useState();
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      Promise.all(
        data.buildings.map((b) =>
          adminApi.simulate(baseRequest(b.id, data.defaults), signal),
        ),
      ),
      adminApi.referenceFactors(signal),
      adminApi.turbines(signal),
    ])
      .then(([sims, refs, list]) => {
        setError("");
        setResults(sims);
        setFactors(refs);
        setTurbines(list);
        if (list[0])
          return adminApi.turbine(list[0].id, signal).then(setTurbine);
      })
      .catch((e) => !isAbort(e) && setError(errorText(e)));
    return () => controller.abort();
  }, [data.buildings, data.defaults, retry]);

  const selectTurbine = (id) =>
    adminApi
      .turbine(id)
      .then(setTurbine)
      .catch((e) => setError(errorText(e)));

  const top =
    results.find((r) => r.buildingId === data.buildings[0]?.id) ?? results[0];
  return (
    <>
      <SubTabs tabs={TABS} value={tab} onChange={onTab} />
      <ErrorNote error={error} onRetry={() => setRetry((v) => v + 1)} />
      {tab === "money" && (
        <section className={cx("panel")}>
          <h3>
            건물별 경제성{" "}
            <span className={cx("note")}>
              <Term k="1차 실측" /> 15시 값 · 기본 가정 · 터빈 1 기준
            </span>
          </h3>
          <table>
            <thead>
              <tr>
                <th>건물</th>
                <th>회수 전력</th>
                <th>연간 발전량</th>
                <th>연간 절감</th>
                <th>탄소 저감</th>
                <th>
                  <Term k="회수기간" />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.buildingId}>
                  <td>{r.buildingName}</td>
                  <td>{format(r.recoveredPowerW, 2)} W</td>
                  <td>{format(r.annualEnergyKwh, 2)} kWh</td>
                  <td>{format(r.annualSavingsKrw, 0)}원</td>
                  <td>{format(r.annualCarbonReductionKg, 2)} kg</td>
                  <td>
                    <b>{yearsText(paybackOf(r))}</b>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={cx("btn sm")}
                      onClick={() => onReview(r.buildingId)}
                    >
                      검토서
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={cx("concl spaced")}>
            가장 유리한 {top?.buildingName ?? "후보"}도 단일 소형 터빈
            회수기간이 약 {top ? Math.round(paybackOf(top)) : "—"}년입니다.
            그래서 지금 결론은 <b>"설치보다 검증 우선순위가 먼저"</b>이고, 여러
            배기구 설치·면적 확대·센서 보조전원처럼 가치가 생기는 조건을
            검토서에서 따져 봅니다.
          </div>
        </section>
      )}
      {tab === "carbon" && (
        <>
          <div className={cx("grid g2")}>
            <section className={cx("panel")}>
              <h3>탄소 저감 설명</h3>
              <table>
                <thead>
                  <tr>
                    <th>건물</th>
                    <th>연간 발전량</th>
                    <th>탄소 저감</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.buildingId}>
                      <td>{r.buildingName}</td>
                      <td>{format(r.annualEnergyKwh, 2)} kWh</td>
                      <td>{format(r.annualCarbonReductionKg, 2)} kgCO₂</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={cx("mono decision-actions")}>
                탄소 저감(kg) = 연간 발전량(kWh) × 탄소 배출계수(
                {data.defaults.carbonFactorKgPerKwh} kgCO₂/kWh)
              </p>
              <p className={cx("note lh")}>
                {top?.interpretation?.environment} (1차 실측 15시 값 · 기본 가정
                기준)
              </p>
            </section>
            <section className={cx("panel")}>
              <h3>계수 출처</h3>
              <table>
                <thead>
                  <tr>
                    <th>계수</th>
                    <th>값</th>
                    <th>출처·버전</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {factors.map((f) => (
                    <tr key={f.type}>
                      <td>{label(f.type)}</td>
                      <td>
                        {f.value} {label(f.unit)}
                      </td>
                      <td>
                        {f.sourceName === "DEMO_ASSUMPTION"
                          ? "가정값"
                          : f.sourceName}{" "}
                        · {f.version}
                      </td>
                      <td>
                        <Badge code={f.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={cx("note")}>
                아직 공식 출처로 검증되지 않은 가정값입니다. 공식 배출계수로
                바꾸면 모든 결과가 같은 기준으로 다시 계산됩니다.
              </p>
            </section>
          </div>
          <section className={cx("panel")}>
            <h3>계산 가정과 공식</h3>
            <div className={cx("grid g2")}>
              <dl className={cx("kv")}>
                <div>
                  <dt>회수 면적·변환계수</dt>
                  <dd>
                    {data.defaults.collectionAreaM2} m² ·{" "}
                    {data.defaults.efficiencyPercent}%
                  </dd>
                </div>
                <div>
                  <dt>거리·각도</dt>
                  <dd>
                    {data.defaults.distanceM} m · {data.defaults.angleDegrees}°
                  </dd>
                </div>
                <div>
                  <dt>운전</dt>
                  <dd>
                    하루 {data.defaults.operatingHoursPerDay}시간 ·{" "}
                    {data.defaults.operatingDaysPerYear}일
                  </dd>
                </div>
              </dl>
              <div className={cx("inner")}>
                {data.defaults.formulas.map((f) => (
                  <div className={cx("mono")} key={f}>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
      {tab === "turbine" && (
        <section className={cx("panel")}>
          <h3>등록된 터빈 제품</h3>
          <div className={cx("grid g2")}>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>제품</th>
                    <th>수풍 면적</th>
                    <th>검증</th>
                  </tr>
                </thead>
                <tbody>
                  {turbines.map((t) => (
                    <tr
                      key={t.id}
                      className={cx("click")}
                      tabIndex={0}
                      onClick={() => selectTurbine(t.id)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && selectTurbine(t.id)
                      }
                    >
                      <td>
                        {label(t.manufacturer)} · {t.model}
                      </td>
                      <td>{t.rotorAreaM2} m²</td>
                      <td>
                        <Badge code={t.verificationStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={cx("note lh")}>
                {turbine?.source}. 제조사 성능표나 교내 시험으로 출력 곡선이
                검증되면 "검증됨"으로 바뀌고 실측 기반 예측의 정확도가
                올라갑니다. 검토서의 "터빈 1~3"은 가격 비교용 가정 제품입니다.
              </p>
            </div>
            <div className={cx("inner")}>
              <div className={cx("label")}>풍속별 출력 곡선 (W)</div>
              <AreaChart
                label="터빈 출력 곡선"
                unit="W"
                points={(turbine?.powerCurve ?? []).map((p) => ({
                  x: `${p.windSpeedMS}m/s`,
                  y: p.powerW,
                }))}
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default Evidence;
