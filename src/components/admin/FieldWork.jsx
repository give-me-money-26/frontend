import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminEndpoints";
import { ApiError, isAbort } from "../../api/client";
import AdminDialog from "./AdminDialog";
import { cx } from "./cx";
import { label } from "./labels";
import { parseMeasurementCsv } from "./measurementCsv";
import {
  errorText,
  format,
  nextAction,
  seoulDate,
  seoulTime,
  stageOf,
  toSeoulIso,
  todaySeoul,
} from "./shared";
import {
  Badge,
  BuildingSelect,
  ConfirmWrite,
  DatePicker,
  Drawer,
  Dropdown,
  Empty,
  ErrorNote,
  SubTabs,
} from "./ui";
import useFetch from "./useFetch";

const PAGE_SIZE = 20;
const MAX_SPEED = 60;
const BATCH_LIMIT = 1000;
const TABS = [
  ["todo", "오늘 할 일"],
  ["meas", "측정 기록"],
  ["assets", "배기구·장비"],
];
const QUALITY_FLAGS = ["VALID", "SUSPECT", "INVALID"].map((flag) => [
  flag,
  label(flag),
]);
const HVAC_STATES = [
  ["ON", "가동"],
  ["OFF", "정지"],
  ["UNKNOWN", "확인 전"],
];

function measurementProblem(form, speed) {
  if (!form.ventId) return "배기구를 고르세요.";
  if (!form.sensorId) return "장비를 고르세요.";
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(form.at))
    return "측정 시각을 입력하세요.";
  if (form.speed === "" || !(speed >= 0 && speed <= MAX_SPEED))
    return `풍속은 0~${MAX_SPEED} m/s 사이 숫자로 입력하세요.`;
  if (!form.state) return "HVAC 가동·정지 상태를 고르세요.";
  return "";
}
function FieldWork({
  data,
  tab,
  onTab,
  buildingId,
  onBuilding,
  onChanged,
  toast,
}) {
  const [vents, setVents] = useState([]);
  const [page, setPage] = useState();
  const [pageNo, setPageNo] = useState(0);
  const [range, setRange] = useState({ from: "", to: "" });
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [openMeasurement, setOpenMeasurement] = useState(null);
  const [openVent, setOpenVent] = useState(null);
  const [openSensor, setOpenSensor] = useState(null);
  const [form, setForm] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      adminApi.vents(buildingId, signal),
      adminApi.measurements(
        {
          buildingId,
          from: range.from ? `${range.from}T00:00:00+09:00` : undefined,
          to: range.to ? `${range.to}T23:59:59+09:00` : undefined,
          page: pageNo,
          size: PAGE_SIZE,
        },
        signal,
      ),
    ])
      .then(([v, p]) => {
        setError("");
        setVents(v);
        setPage(p);
      })
      .catch((e) => !isAbort(e) && setError(errorText(e)));
    return () => controller.abort();
  }, [buildingId, pageNo, range.from, range.to, reload]);
  const refresh = () => {
    setReload((v) => v + 1);
    onChanged();
  };
  const name =
    data.buildings.find((b) => b.id === buildingId)?.name ?? buildingId;
  const rangeError =
    range.from && range.to && range.from > range.to
      ? "시작 날짜가 끝 날짜보다 늦습니다."
      : "";
  const ventName = (id) => vents.find((v) => v.id === id)?.name ?? id;
  const changeRange = (patch) => {
    setRange((prev) => ({ ...prev, ...patch }));
    setPageNo(0);
  };
  const buildingSelect = (
    <BuildingSelect
      buildings={data.buildings}
      value={buildingId}
      onChange={onBuilding}
    />
  );
  const formButtons = (
    <>
      <button
        type="button"
        className={cx("btn")}
        onClick={() => setForm("one")}
        disabled={!vents.length}
      >
        측정 등록
      </button>
      <button
        type="button"
        className={cx("btn pri")}
        onClick={() => setForm("batch")}
        disabled={!vents.length}
      >
        CSV 일괄 업로드
      </button>
    </>
  );
  return (
    <>
      <SubTabs tabs={TABS} value={tab} onChange={onTab} />
      <ErrorNote error={error} onRetry={() => setReload((v) => v + 1)} />

      {tab === "todo" && (
        <section className={cx("panel")}>
          <h3>측정 요청이 온 후보</h3>
          <table>
            <thead>
              <tr>
                <th>건물</th>
                <th>배기구</th>
                <th>등록된 기록</th>
                <th>해야 할 일</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.candidates
                .filter((c) => stageOf(c, data.decisions) === "MEASURE")
                .map((c) => (
                  <tr key={c.id}>
                    <td>{c.buildingName}</td>
                    <td>{c.ventName}</td>
                    <td>{c.measurementCount}건</td>
                    <td>{nextAction("MEASURE")}</td>
                    <td>
                      <button
                        type="button"
                        className={cx("btn sm")}
                        onClick={() => {
                          onBuilding(c.buildingId);
                          onTab("meas");
                        }}
                      >
                        기록하기
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p className={cx("note lh")}>
            측정할 때 꼭 남길 것: 배기구 · 장비 · 측정 시각 ·{" "}
            <b>HVAC 가동/정지</b> · 풍속. 가동·정지를 나눠 재야 배기풍과 주변
            기류를 구분할 수 있습니다.
          </p>
        </section>
      )}

      {tab === "meas" && (
        <>
          <div className={cx("row between controls")}>
            <div className={cx("row")}>
              {buildingSelect}
              <DatePicker
                label="시작"
                value={range.from}
                onChange={(from) => changeRange({ from })}
              />
              <DatePicker
                label="끝"
                value={range.to}
                onChange={(to) => changeRange({ to })}
              />
              {(range.from || range.to) && (
                <button
                  type="button"
                  className={cx("btn sm")}
                  onClick={() => changeRange({ from: "", to: "" })}
                >
                  기간 지우기
                </button>
              )}
            </div>
            <div className={cx("row")}>{formButtons}</div>
          </div>
          <ErrorNote error={rangeError} />
          {page && page.totalElements > 0 ? (
            <section className={cx("panel")}>
              <h3>
                {name} 측정 기록{" "}
                <span className={cx("note")}>{page.totalElements}건</span>
              </h3>
              <table>
                <thead>
                  <tr>
                    <th>측정 시각</th>
                    <th>배기구</th>
                    <th>풍속</th>
                    <th>에너지 밀도</th>
                    <th>HVAC</th>
                    <th>품질</th>
                  </tr>
                </thead>
                <tbody>
                  {page.content.map((m) => (
                    <tr
                      key={m.id}
                      className={cx("click")}
                      tabIndex={0}
                      onClick={() => setOpenMeasurement(m.id)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setOpenMeasurement(m.id)
                      }
                    >
                      <td>{seoulTime(m.measuredAt)}</td>
                      <td>{ventName(m.ventId)}</td>
                      <td>{format(m.windSpeedMS, 2)} m/s</td>
                      <td>{format(m.windDensityWM2, 1)} W/m²</td>
                      <td>{label(m.operatingState)}</td>
                      <td>
                        <Badge code={m.qualityFlag} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {page.totalPages > 1 && (
                <div className={cx("row end pager")}>
                  <button
                    type="button"
                    className={cx("btn sm")}
                    disabled={page.first}
                    onClick={() => setPageNo((p) => p - 1)}
                  >
                    이전
                  </button>
                  <span className={cx("note")}>
                    {page.number + 1} / {page.totalPages}
                  </span>
                  <button
                    type="button"
                    className={cx("btn sm")}
                    disabled={page.last}
                    onClick={() => setPageNo((p) => p + 1)}
                  >
                    다음
                  </button>
                </div>
              )}
            </section>
          ) : (
            page && (
              <Empty
                title={`${name}의 측정 기록이 ${range.from || range.to ? "이 기간에 " : ""}없습니다`}
              >
                현장에서 잰 값을 한 건씩 넣거나, 측정기 기록을 CSV로 한 번에
                올리세요.
                <br />
                {formButtons}
              </Empty>
            )
          )}
        </>
      )}

      {tab === "assets" && (
        <div className={cx("grid g2")}>
          <section className={cx("panel")}>
            <h3>배기구</h3>
            <div className={cx("controls")}>{buildingSelect}</div>
            <table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>유형</th>
                  <th>면적</th>
                  <th>좌표</th>
                </tr>
              </thead>
              <tbody>
                {vents.map((v) => (
                  <tr
                    key={v.id}
                    className={cx("click")}
                    tabIndex={0}
                    onClick={() => setOpenVent(v.id)}
                    onKeyDown={(e) => e.key === "Enter" && setOpenVent(v.id)}
                  >
                    <td>{v.name}</td>
                    <td>{label(v.type)}</td>
                    <td>{v.areaM2} m²</td>
                    <td>
                      <Badge code={v.sourceType} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={cx("note")}>
              좌표·치수가 추정값이면 현장 조사 후 실측으로 바꿔야 판정 근거가
              채워집니다.
            </p>
          </section>
          <section className={cx("panel")}>
            <h3>측정 장비</h3>
            <table>
              <thead>
                <tr>
                  <th>장비</th>
                  <th>측정 항목</th>
                  <th>교정</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {data.sensors.map((s) => (
                  <tr
                    key={s.id}
                    className={cx("click")}
                    tabIndex={0}
                    onClick={() => setOpenSensor(s.id)}
                    onKeyDown={(e) => e.key === "Enter" && setOpenSensor(s.id)}
                  >
                    <td>
                      {s.model} ({s.serialNumber})
                    </td>
                    <td>{s.measurementTypes.map(label).join(", ")}</td>
                    <td>
                      {s.calibratedAt ? seoulDate(s.calibratedAt) : "기록 없음"}
                    </td>
                    <td>
                      <Badge code={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={cx("note")}>
              교정 정보가 없는 장비의 값은 판정에서 "장비 확인 필요"로 남습니다.
            </p>
          </section>
        </div>
      )}

      {openMeasurement != null && (
        <MeasurementDrawer
          id={openMeasurement}
          ventName={ventName}
          onClose={() => setOpenMeasurement(null)}
          onSaved={() => {
            refresh();
            toast("품질 판정을 저장했습니다");
          }}
        />
      )}
      {openVent && (
        <VentDrawer id={openVent} onClose={() => setOpenVent(null)} />
      )}
      {openSensor && (
        <SensorDrawer id={openSensor} onClose={() => setOpenSensor(null)} />
      )}
      {form === "one" && (
        <MeasurementForm
          buildingId={buildingId}
          vents={vents}
          sensors={data.sensors}
          existing={page?.content ?? []}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null);
            refresh();
            toast("측정 1건을 저장했습니다");
          }}
        />
      )}
      {form === "batch" && (
        <BatchForm
          buildingId={buildingId}
          vents={vents}
          sensors={data.sensors}
          onClose={() => setForm(null)}
          onSaved={(n) => {
            setForm(null);
            refresh();
            toast(`측정 ${n}건을 저장했습니다`);
          }}
        />
      )}
    </>
  );
}
function MeasurementDrawer({ id, ventName, onClose, onSaved }) {
  const [m, setM] = useState();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [form, setForm] = useState({
    qualityFlag: "VALID",
    reason: "",
    actor: "",
  });
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      adminApi.measurement(id, controller.signal),
      adminApi.qualityHistory(id, controller.signal),
    ])
      .then(([one, hist]) => {
        setM(one);
        setHistory(hist);
        setForm((f) => ({ ...f, qualityFlag: one.qualityFlag }));
      })
      .catch((e) => !isAbort(e) && setError(errorText(e)));
    return () => controller.abort();
  }, [id, reload]);
  return (
    <Drawer title="측정 기록" onClose={onClose}>
      <ErrorNote error={error} />
      {m && (
        <>
          <section className={cx("panel")}>
            <h3>원본 (바꿀 수 없음)</h3>
            <dl className={cx("kv")}>
              <div>
                <dt>건물·배기구</dt>
                <dd>
                  {m.buildingName} · {ventName(m.ventId)}
                </dd>
              </div>
              <div>
                <dt>장비</dt>
                <dd>{m.sensorId}</dd>
              </div>
              <div>
                <dt>측정 시각</dt>
                <dd>{seoulTime(m.measuredAt, true)} (한국 시간)</dd>
              </div>
              <div>
                <dt>풍속</dt>
                <dd>
                  {format(m.windSpeedMS, 2)} m/s → {format(m.windDensityWM2, 1)}{" "}
                  W/m²
                </dd>
              </div>
              <div>
                <dt>HVAC</dt>
                <dd>{label(m.operatingState)}</dd>
              </div>
              <div>
                <dt>품질</dt>
                <dd>
                  <Badge code={m.qualityFlag} />
                </dd>
              </div>
            </dl>
          </section>
          <section className={cx("panel")}>
            <h3>품질 판정</h3>
            <div className={cx("row")}>
              <Dropdown
                label="판정"
                value={form.qualityFlag}
                options={QUALITY_FLAGS}
                onChange={(qualityFlag) => setForm({ ...form, qualityFlag })}
              />
              <label className={cx("field grow")}>
                사유 (필수)
                <input
                  value={form.reason}
                  maxLength={200}
                  placeholder="예: 센서 위치가 배기구에서 벗어남"
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </label>
              <label className={cx("field")}>
                검토자 (필수)
                <input
                  value={form.actor}
                  maxLength={40}
                  onChange={(e) => setForm({ ...form, actor: e.target.value })}
                />
              </label>
            </div>
            <div className={cx("row end decision-actions")}>
              <button
                type="button"
                className={cx("btn pri")}
                disabled={
                  !form.reason.trim() ||
                  !form.actor.trim() ||
                  form.qualityFlag === m.qualityFlag
                }
                onClick={() => setConfirm(true)}
              >
                판정 저장
              </button>
            </div>
            {form.qualityFlag === m.qualityFlag && (
              <p className={cx("note")}>
                지금과 다른 판정을 고르면 저장할 수 있습니다.
              </p>
            )}
          </section>
          <section className={cx("panel")}>
            <h3>판정 이력</h3>
            {history.length ? (
              <table>
                <thead>
                  <tr>
                    <th>시각</th>
                    <th>변경</th>
                    <th>사유</th>
                    <th>검토자</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td>{seoulTime(h.changedAt)}</td>
                      <td>
                        <Badge code={h.previousFlag} /> →{" "}
                        <Badge code={h.newFlag} />
                      </td>
                      <td>{h.reason}</td>
                      <td>{h.actor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={cx("note")}>
                이력이 없습니다. 원본 값은 바꾸지 않고 판정만 이력으로 쌓입니다.
              </p>
            )}
          </section>
        </>
      )}
      {confirm && m && (
        <ConfirmWrite
          title="품질 판정 저장"
          rows={[
            ["기록", seoulTime(m.measuredAt)],
            ["판정", `${label(m.qualityFlag)} → ${label(form.qualityFlag)}`],
            ["사유", form.reason],
            ["검토자", form.actor],
          ]}
          onCancel={() => setConfirm(false)}
          onConfirm={async () => {
            await adminApi.updateQuality(m.id, {
              qualityFlag: form.qualityFlag,
              reason: form.reason.trim(),
              actor: form.actor.trim(),
            });
            setConfirm(false);
            setForm((f) => ({ ...f, reason: "" }));
            setReload((v) => v + 1);
            onSaved();
          }}
        />
      )}
    </Drawer>
  );
}
function MeasurementForm({
  buildingId,
  vents,
  sensors,
  existing,
  onClose,
  onSaved,
}) {
  const [v, setV] = useState({
    ventId: vents[0]?.id ?? "",
    sensorId: sensors[0]?.id ?? "",
    at: `${todaySeoul()}T15:00`,
    speed: "",
    state: "",
  });
  const [confirm, setConfirm] = useState(false);
  const speed = Number(v.speed);
  const problem = measurementProblem(v, speed);
  const vent = vents.find((x) => x.id === v.ventId);
  const measuredAt = toSeoulIso(v.at);
  const duplicate = existing.some(
    (m) =>
      m.ventId === v.ventId &&
      Math.abs(new Date(m.measuredAt) - new Date(measuredAt)) < 60_000,
  );
  const body = {
    buildingId,
    ventId: v.ventId,
    sensorId: v.sensorId,
    measuredAt,
    timezone: "Asia/Seoul",
    windSpeedMS: speed,
    ventAreaM2: vent?.areaM2 ?? 0.8,
    qualityFlag: "VALID",
    operatingState: v.state || "UNKNOWN",
  };
  return confirm ? (
    <ConfirmWrite
      title="측정 등록"
      rows={[
        ["배기구", vent?.name ?? ""],
        ["시각", v.at.replace("T", " ")],
        ["풍속", `${speed} m/s`],
        ["HVAC", label(body.operatingState)],
      ]}
      onCancel={() => setConfirm(false)}
      onConfirm={async () => {
        await adminApi.createMeasurement(body);
        onSaved();
      }}
    />
  ) : (
    <AdminDialog title="측정 등록" onClose={onClose}>
      <div className={cx("grid g2")}>
        <Dropdown
          label="배기구"
          value={v.ventId}
          options={vents.map((x) => [x.id, x.name])}
          onChange={(ventId) => setV({ ...v, ventId })}
        />
        <Dropdown
          label="장비"
          value={v.sensorId}
          options={sensors.map((s) => [s.id, `${s.model} (${s.serialNumber})`])}
          onChange={(sensorId) => setV({ ...v, sensorId })}
        />
        <DatePicker
          label="측정 날짜"
          value={v.at.slice(0, 10)}
          onChange={(date) => setV({ ...v, at: `${date}T${v.at.slice(11)}` })}
        />
        <label className={cx("field")}>
          측정 시각 (한국 시간)
          <input
            type="time"
            value={v.at.slice(11)}
            onChange={(e) =>
              setV({ ...v, at: `${v.at.slice(0, 10)}T${e.target.value}` })
            }
          />
        </label>
        <label className={cx("field")}>
          풍속 (m/s)
          <input
            type="number"
            min={0}
            max={MAX_SPEED}
            step={0.01}
            value={v.speed}
            placeholder="예: 3.2"
            onChange={(e) => setV({ ...v, speed: e.target.value })}
          />
        </label>
        <Dropdown
          label="HVAC 상태"
          value={v.state}
          options={HVAC_STATES}
          placeholder="고르세요"
          onChange={(state) => setV({ ...v, state })}
        />
      </div>
      <p className={cx("note")}>
        HVAC 가동·정지는 배기풍과 주변 기류를 나누는 데 필요해 꼭 고릅니다.
      </p>
      <ErrorNote error={problem && v.speed !== "" ? problem : ""} />
      {duplicate && (
        <div className={cx("warnbox")}>
          같은 배기구·같은 시각 기록이 이미 있습니다. 다시 잰 값이 맞는지
          확인하세요.
        </div>
      )}
      <div className={cx("row end")}>
        <button type="button" className={cx("btn")} onClick={onClose}>
          취소
        </button>
        <button
          type="button"
          className={cx("btn pri")}
          disabled={Boolean(problem)}
          onClick={() => setConfirm(true)}
        >
          다음
        </button>
      </div>
    </AdminDialog>
  );
}

function BatchForm({ buildingId, vents, sensors, onClose, onSaved }) {
  const sample = `기록번호,측정시각,풍속,HVAC\nTEST-0001,${todaySeoul()} 13:00,2.9,가동\nTEST-0002,${todaySeoul()} 15:00,3.4,가동\nTEST-0003,${todaySeoul()} 17:00,1.8,정지`;
  const [text, setText] = useState(sample);
  const [batchId, setBatchId] = useState(
    `TEST-BATCH-${todaySeoul().replace(/-/g, "")}`,
  );
  const [confirm, setConfirm] = useState(false);
  const fallback = {
    buildingId,
    ventId: vents[0]?.id ?? "",
    sensorId: sensors[0]?.id ?? "",
    ventAreaM2: vents[0]?.areaM2 ?? 0.8,
  };
  const parsed = parseMeasurementCsv(text, fallback);
  const tooMany = parsed.records.length > BATCH_LIMIT;
  return confirm ? (
    <ConfirmWrite
      title={`CSV 일괄 업로드 · ${parsed.records.length}건`}
      rows={[
        ["배치 ID", batchId],
        ["건수", `${parsed.records.length}건`],
        ["배기구", vents[0]?.name ?? ""],
      ]}
      onCancel={() => setConfirm(false)}
      onConfirm={async () => {
        try {
          const r = await adminApi.createMeasurementBatch(
            batchId.trim(),
            parsed.records,
          );
          onSaved(r.accepted);
        } catch (e) {
          if (e instanceof ApiError && e.status === 409)
            throw new Error(`이미 올린 기록번호가 있습니다. ${e.message}`, {
              cause: e,
            });
          throw e;
        }
      }}
    />
  ) : (
    <AdminDialog title="CSV 일괄 업로드" onClose={onClose}>
      <label className={cx("field")}>
        측정기 기록 붙여넣기 (머리줄: 기록번호, 측정시각, 풍속, HVAC)
        <textarea
          rows={7}
          className={cx("mono")}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className={cx("row decision-meta")}>
        <input
          type="file"
          accept=".csv,text/csv"
          aria-label="CSV 파일 선택"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) f.text().then(setText);
          }}
        />
        <label className={cx("field")}>
          배치 ID
          <input
            value={batchId}
            maxLength={60}
            onChange={(e) => setBatchId(e.target.value)}
          />
        </label>
      </div>
      <p className={cx("note")}>
        {parsed.records.length}건 읽음 · 한 번에 {BATCH_LIMIT}건까지. 이미 올린
        기록번호는 서버가 중복으로 거부합니다.
      </p>
      {parsed.errors.length > 0 && (
        <div className={cx("error")} role="alert">
          {parsed.errors.slice(0, 5).map((x) => (
            <div key={x}>{x}</div>
          ))}
          {parsed.errors.length > 5 && (
            <div>외 {parsed.errors.length - 5}줄</div>
          )}
        </div>
      )}
      {tooMany && (
        <ErrorNote
          error={`${BATCH_LIMIT}건이 넘습니다. 파일을 나눠 올려 주세요.`}
        />
      )}
      <div className={cx("row end")}>
        <button type="button" className={cx("btn")} onClick={onClose}>
          취소
        </button>
        <button
          type="button"
          className={cx("btn pri")}
          disabled={
            !parsed.records.length ||
            parsed.errors.length > 0 ||
            tooMany ||
            !batchId.trim()
          }
          onClick={() => setConfirm(true)}
        >
          올리기
        </button>
      </div>
    </AdminDialog>
  );
}

function VentDrawer({ id, onClose }) {
  const [v, error] = useFetch((signal) => adminApi.vent(id, signal), id);
  return (
    <Drawer title={v?.name ?? "배기구"} onClose={onClose}>
      <ErrorNote error={error} />
      {v && (
        <dl className={cx("kv panel")}>
          <div>
            <dt>유형</dt>
            <dd>{label(v.type)}</dd>
          </div>
          <div>
            <dt>면적</dt>
            <dd>{v.areaM2} m²</dd>
          </div>
          <div>
            <dt>배기 방향</dt>
            <dd>{v.directionDegrees}°</dd>
          </div>
          <div>
            <dt>좌표</dt>
            <dd>
              {v.position.x == null
                ? "미측정"
                : `${v.position.x}, ${v.position.y}, ${v.position.z} (${label(v.position.coordinateSystem)})`}
            </dd>
          </div>
          <div>
            <dt>상태·근거</dt>
            <dd>
              <Badge code={v.status} /> <Badge code={v.sourceType} />
            </dd>
          </div>
        </dl>
      )}
    </Drawer>
  );
}
function SensorDrawer({ id, onClose }) {
  const [s, error] = useFetch((signal) => adminApi.sensor(id, signal), id);
  return (
    <Drawer title={s?.model ?? "측정 장비"} onClose={onClose}>
      <ErrorNote error={error} />
      {s && (
        <dl className={cx("kv panel")}>
          <div>
            <dt>제조사</dt>
            <dd>{label(s.manufacturer)}</dd>
          </div>
          <div>
            <dt>일련번호</dt>
            <dd>{s.serialNumber}</dd>
          </div>
          <div>
            <dt>측정 항목</dt>
            <dd>{s.measurementTypes.map(label).join(", ")}</dd>
          </div>
          <div>
            <dt>정확도</dt>
            <dd>{s.accuracy ?? "—"}</dd>
          </div>
          <div>
            <dt>교정</dt>
            <dd>
              {s.calibratedAt ? seoulTime(s.calibratedAt, true) : "기록 없음"}
            </dd>
          </div>
          <div>
            <dt>상태</dt>
            <dd>
              <Badge code={s.status} />
            </dd>
          </div>
        </dl>
      )}
    </Drawer>
  );
}

export default FieldWork;
