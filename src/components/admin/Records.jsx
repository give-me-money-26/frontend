import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminEndpoints";
import { ApiError, isAbort } from "../../api/client";
import { cx } from "./cx";
import { label } from "./labels";
import {
  byRecent,
  errorText,
  format,
  seoulDate,
  seoulTime,
  todaySeoul,
} from "./shared";
import {
  AreaChart,
  Badge,
  Big,
  BuildingSelect,
  ConfirmWrite,
  DatePicker,
  Drawer,
  Dropdown,
  Empty,
  ErrorNote,
  SubTabs,
  Term,
} from "./ui";
import useFetch from "./useFetch";

const TABS = [
  ["ts", "실측 기반 예측"],
  ["val", "예측-실측 검증"],
  ["dec", "결정 기록·보고"],
];
const THRESHOLDS = {
  maxMaeW: 1,
  maxRmseW: 1,
  maxMapePercent: 20,
  maxAbsoluteBiasW: 0.5,
};
const MAX_POWER_W = 10_000;
const POLICIES = [
  ["VALID_AND_SUSPECT", "정상 + 의심"],
  ["VALID_ONLY", "정상만"],
];

const parsePairs = (text) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/[,\s]+/).map(Number));

function pairProblem(pairs) {
  if (!pairs.length) return "예측·실측 전력을 한 줄에 한 쌍씩 넣어 주세요.";
  if (pairs.some((p) => p.length !== 2 || p.some((x) => !(x >= 0))))
    return '각 줄은 "예측 W, 실측 W" 두 숫자(0 이상)여야 합니다.';
  if (pairs.some(([, actual]) => actual === 0))
    return "실측 전력이 0이면 백분율 오차를 계산할 수 없습니다. 0보다 큰 값을 넣어 주세요.";
  if (pairs.some((p) => p.some((x) => x > MAX_POWER_W)))
    return "10,000 W를 넘는 값은 소형 터빈 범위를 벗어납니다. 단위를 확인해 주세요.";
  return "";
}
function Records({
  data,
  tab,
  onTab,
  buildingId,
  onBuilding,
  onReview,
  onField,
  toast,
}) {
  const candidate = data.candidates.find((c) => c.buildingId === buildingId);
  const buildingName = (id) =>
    data.buildings.find((b) => b.id === id)?.name ?? id;
  const name = buildingName(buildingId);
  const [turbines, setTurbines] = useState([]);
  const [ts, setTs] = useState({
    turbineId: "",
    from: "",
    to: todaySeoul(),
    policy: "VALID_AND_SUSPECT",
  });
  const [series, setSeries] = useState(null);
  const [tsEmpty, setTsEmpty] = useState("");
  const [tsBusy, setTsBusy] = useState(false);
  const [validations, setValidations] = useState([]);
  const [openValidation, setOpenValidation] = useState(null);
  const [scene, setScene] = useState();
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [pairs, setPairs] = useState("");
  const [model, setModel] = useState("sim-v1");
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      adminApi.turbines(signal),
      adminApi.validations(undefined, signal),
      adminApi.sceneConfig(buildingId, signal),
    ])
      .then(([t, v, s]) => {
        setError("");
        setTurbines(t);
        setTs((x) => ({ ...x, turbineId: x.turbineId || t[0]?.id || "" }));
        setValidations(v);
        setScene(s);
      })
      .catch((e) => !isAbort(e) && setError(errorText(e)));
    return () => controller.abort();
  }, [buildingId, reload]);
  const runSeries = () => {
    if (!candidate) return;
    setTsBusy(true);
    setTsEmpty("");
    setSeries(null);
    adminApi
      .timeseries({
        buildingId,
        ventId: candidate.ventId,
        turbineId: ts.turbineId,
        from: `${ts.from || "2026-01-01"}T00:00:00+09:00`,
        to: `${ts.to}T23:59:59+09:00`,
        qualityPolicy: ts.policy,
        distanceM: data.defaults.distanceM,
        angleDegrees: data.defaults.angleDegrees,
        tariffKrwPerKwh: data.defaults.tariffKrwPerKwh,
        carbonFactorKgPerKwh: data.defaults.carbonFactorKgPerKwh,
      })
      .then(setSeries)
      .catch((e) =>
        e instanceof ApiError && e.status === 422
          ? setTsEmpty(e.message)
          : setError(errorText(e)),
      )
      .finally(() => setTsBusy(false));
  };
  const downloadCsv = () =>
    adminApi
      .exportMeasurements({ buildingId })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `측정기록_${buildingId}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      })
      .catch((e) => setError(errorText(e)));
  const parsed = parsePairs(pairs);
  const pairError = pairProblem(parsed);
  const rangeError =
    ts.from && ts.to && ts.from > ts.to
      ? "시작 날짜가 끝 날짜보다 늦습니다."
      : "";
  const buildingSelect = (
    <BuildingSelect
      buildings={data.buildings}
      value={buildingId}
      onChange={onBuilding}
    />
  );
  return (
    <>
      <SubTabs tabs={TABS} value={tab} onChange={onTab} />
      <ErrorNote error={error} onRetry={() => setReload((v) => v + 1)} />

      {tab === "ts" && (
        <section className={cx("panel")}>
          <h3>실측 기반 예측</h3>
          <div className={cx("row controls")}>
            {buildingSelect}
            <Dropdown
              label="터빈"
              value={ts.turbineId}
              options={turbines.map((t) => [
                t.id,
                `${t.model} (${label(t.verificationStatus)})`,
              ])}
              onChange={(turbineId) => setTs({ ...ts, turbineId })}
            />
            <Dropdown
              label="포함할 기록"
              value={ts.policy}
              options={POLICIES}
              onChange={(policy) => setTs({ ...ts, policy })}
            />
            <DatePicker
              label="시작"
              value={ts.from}
              onChange={(from) => setTs({ ...ts, from })}
            />
            <DatePicker
              label="끝"
              value={ts.to}
              onChange={(to) => setTs({ ...ts, to })}
            />
            <button
              type="button"
              className={cx("btn pri")}
              disabled={tsBusy || !ts.turbineId || Boolean(rangeError)}
              onClick={runSeries}
            >
              {tsBusy ? "계산 중…" : "예측 실행"}
            </button>
          </div>
          <ErrorNote error={rangeError} />
          {series ? (
            <>
              <div className={cx("grid g12")}>
                <div className={cx("grid")}>
                  <div className={cx("inner")}>
                    <div className={cx("label")}>기간 발전량</div>
                    <Big value={series.energyKwh} unit="kWh" digits={3} />
                  </div>
                  <div className={cx("inner")}>
                    <div className={cx("label")}>사용한 기록 · 결측 구간</div>
                    <Big
                      value={series.dataWindow.points}
                      unit={`건 · 결측 ${series.dataWindow.missingIntervals}`}
                      digits={0}
                    />
                  </div>
                </div>
                <div className={cx("inner")}>
                  <div className={cx("label")}>기록 시점별 예상 출력 (W)</div>
                  <AreaChart
                    label="기록 시점별 예상 출력"
                    unit="W"
                    points={series.series.map((p) => ({
                      x: seoulTime(p.measuredAt).slice(3, 11),
                      y: p.powerW,
                    }))}
                  />
                </div>
              </div>
              <p className={cx("note")}>{series.limitations.join(" · ")}</p>
            </>
          ) : tsEmpty ? (
            <Empty title={`${name}에는 예측에 쓸 반복 실측 기록이 없습니다`}>
              실측 기반 예측은 원시 기록이 쌓여야 계산됩니다. ({tsEmpty})<br />
              <button type="button" className={cx("btn pri")} onClick={onField}>
                현장 실측으로
              </button>
            </Empty>
          ) : (
            <p className={cx("note")}>
              건물·터빈·기간을 고르고 "예측 실행"을 누르세요. 하루 측정 가정이
              아니라 실제 반복 실측 시점을 이어 계산합니다.
            </p>
          )}
        </section>
      )}

      {tab === "val" && (
        <div className={cx("grid g2")}>
          <section className={cx("panel")}>
            <h3>예측-실측 검증 만들기</h3>
            {buildingSelect}
            <label className={cx("field decision-actions")}>
              모델 버전
              <input
                value={model}
                maxLength={40}
                onChange={(e) => setModel(e.target.value)}
              />
            </label>
            <label className={cx("field decision-actions")}>
              예측 W, 실측 W (한 줄에 한 쌍)
              <textarea
                rows={5}
                className={cx("mono")}
                value={pairs}
                placeholder={"예)\n3.3, 3.0\n3.8, 3.5"}
                onChange={(e) => setPairs(e.target.value)}
              />
            </label>
            <ErrorNote error={pairs.trim() ? pairError : ""} />
            <p className={cx("note")}>
              통과 기준: 평균 오차(MAE)·RMSE 1W 이하, 백분율 오차 20% 이하, 편향
              0.5W 이하
            </p>
            <div className={cx("row end")}>
              <button
                type="button"
                className={cx("btn pri")}
                disabled={Boolean(pairError) || !candidate || !model.trim()}
                onClick={() => setConfirm(true)}
              >
                검증 저장
              </button>
            </div>
          </section>
          <section className={cx("panel")}>
            <h3>검증 결과</h3>
            {validations.length ? (
              <table>
                <thead>
                  <tr>
                    <th>건물</th>
                    <th>모델</th>
                    <th>표본</th>
                    <th>
                      <Term k="예측-실측 오차">평균 오차</Term>
                    </th>
                    <th>백분율 오차</th>
                    <th>결과</th>
                    <th>시각</th>
                  </tr>
                </thead>
                <tbody>
                  {validations.map((v) => (
                    <tr
                      key={v.id}
                      className={cx("click")}
                      tabIndex={0}
                      onClick={() => setOpenValidation(v.id)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setOpenValidation(v.id)
                      }
                    >
                      <td>{buildingName(v.buildingId)}</td>
                      <td>{v.predictionModelVersion}</td>
                      <td>{v.sampleCount}쌍</td>
                      <td>{format(v.metrics.maeW, 2)} W</td>
                      <td>{format(v.metrics.mapePercent, 1)}%</td>
                      <td>
                        <Badge
                          code={v.acceptance.passed ? "passed" : "failed"}
                        />
                      </td>
                      <td>{seoulTime(v.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty title="검증 결과가 없습니다">
                소형 장치 실험으로 실측 전력을 얻으면 예측과 비교해 남깁니다.
              </Empty>
            )}
          </section>
        </div>
      )}

      {tab === "dec" && (
        <>
          <section className={cx("panel")}>
            <h3>결정 기록 전체</h3>
            {data.decisions.length ? (
              <table>
                <thead>
                  <tr>
                    <th>후보</th>
                    <th>단계</th>
                    <th>사유</th>
                    <th>담당</th>
                    <th>기한</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.decisions.toSorted(byRecent).map((d) => (
                    <tr key={d.id}>
                      <td>
                        {data.candidates.find((c) => c.id === d.candidateId)
                          ?.buildingName ?? d.candidateId}
                      </td>
                      <td>
                        <Badge code={d.status} />
                      </td>
                      <td>{d.reason}</td>
                      <td>{d.assignee ?? "—"}</td>
                      <td>{d.dueAt ? seoulDate(d.dueAt) : "—"}</td>
                      <td>
                        <button
                          type="button"
                          className={cx("btn sm")}
                          onClick={() => onReview(d.candidateId)}
                        >
                          검토서
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty title="아직 남긴 결정이 없습니다">
                후보 검토서에서 측정 필요·설치 검토·보류를 사유와 함께 남기면
                여기 모입니다.
              </Empty>
            )}
          </section>
          <div className={cx("grid g2")}>
            <section className={cx("panel")}>
              <h3>보고 자료</h3>
              <p className={cx("note")}>
                원시 측정 기록을 CSV로 내려받아 시설·환경 부서 보고에 붙입니다.
              </p>
              <div className={cx("row")}>
                {buildingSelect}
                <button
                  type="button"
                  className={cx("btn pri")}
                  onClick={downloadCsv}
                >
                  CSV 내려받기
                </button>
              </div>
            </section>
            <section className={cx("panel")}>
              <h3>3D 표시 설정</h3>
              {scene && (
                <dl className={cx("kv")}>
                  <div>
                    <dt>버전</dt>
                    <dd>{scene.sceneVersion}</dd>
                  </div>
                  <div>
                    <dt>배기구 좌표</dt>
                    <dd>
                      {scene.vents.map((v) => (
                        <Badge key={v.id} code={v.sourceType} />
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt>표시 한계</dt>
                    <dd>{scene.limitations.join(" · ")}</dd>
                  </div>
                </dl>
              )}
              <p className={cx("note")}>
                배기구 실측 좌표가 등록되면 시연 사이트 3D가 이 설정으로 배기구
                위치를 그립니다.
              </p>
            </section>
          </div>
        </>
      )}

      {openValidation && (
        <ValidationDrawer
          id={openValidation}
          name={buildingName}
          onClose={() => setOpenValidation(null)}
        />
      )}
      {confirm && candidate && (
        <ConfirmWrite
          title="예측-실측 검증 저장"
          rows={[
            ["건물", name],
            ["모델 버전", model],
            ["표본", `${parsed.length}쌍`],
          ]}
          onCancel={() => setConfirm(false)}
          onConfirm={async () => {
            await adminApi.createValidation({
              buildingId,
              ventId: candidate.ventId,
              predictionModelVersion: model.trim(),
              samples: parsed.map(([predictedW, actualW]) => ({
                predictedW,
                actualW,
              })),
              thresholds: THRESHOLDS,
            });
            setConfirm(false);
            setPairs("");
            setReload((v) => v + 1);
            toast("검증 결과를 저장했습니다");
          }}
        />
      )}
    </>
  );
}
function ValidationDrawer({ id, name, onClose }) {
  const [v, error] = useFetch((signal) => adminApi.validation(id, signal), id);
  return (
    <Drawer title={v ? `${name(v.buildingId)} 검증` : "검증"} onClose={onClose}>
      <ErrorNote error={error} />
      {v && (
        <>
          <p>
            <Badge code={v.acceptance.passed ? "passed" : "failed"} /> 표본{" "}
            {v.sampleCount}쌍 · 모델 {v.predictionModelVersion} ·{" "}
            {seoulTime(v.createdAt, true)}
          </p>
          <div className={cx("grid g2")}>
            {[
              ["평균 오차 (MAE)", v.metrics.maeW, "W"],
              ["RMSE", v.metrics.rmseW, "W"],
              ["백분율 오차", v.metrics.mapePercent, "%"],
              ["편향 (Bias)", v.metrics.biasW, "W"],
            ].map(([l, x, u]) => (
              <div className={cx("inner")} key={l}>
                <div className={cx("label")}>{l}</div>
                <Big value={x} unit={u} digits={2} />
              </div>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

export default Records;
